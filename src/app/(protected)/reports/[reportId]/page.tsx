import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { p2hReports, p2hResults, units, users, checklistParameters, fluidAdditions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ReportDetail } from '@/components/reports/ReportDetail';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { decryptId } from '@/lib/crypto';

export default async function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  
  const { reportId } = await params;
  const id = decryptId(reportId);
  
  if (id === null) return <div>Invalid Report ID</div>;

  const reportList = await db.select().from(p2hReports).where(eq(p2hReports.id, id)).limit(1);
  const report = reportList[0];
  if (!report) return <div>Report not found</div>;

  const unitList = await db.select().from(units).where(eq(units.id, report.unitId)).limit(1);
  const unit = unitList[0];

  const operatorList = await db.select().from(users).where(eq(users.id, report.operatorId)).limit(1);
  const operator = operatorList[0];

  // Fetch all users to find leader and supervisor from audit_log
  const allUsers = await db.select().from(users);
  
  // Find leader and supervisor from the approval chain
  // Leader = first user with role 'leader', Supervisor = first user with role 'supervisor'
  const leader = allUsers.find(u => u.role === 'leader') || null;
  const supervisor = allUsers.find(u => u.role === 'supervisor') || null;

  const results = await db.select({
    condition: p2hResults.condition,
    photoUrl: p2hResults.photoUrl,
    notes: p2hResults.notes,
    category: checklistParameters.category,
    description: checklistParameters.description,
  })
  .from(p2hResults)
  .leftJoin(checklistParameters, eq(p2hResults.parameterId, checklistParameters.id))
  .where(eq(p2hResults.reportId, id));

  const fluids = await db.select().from(fluidAdditions).where(eq(fluidAdditions.reportId, id));

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/reports" className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
            <ArrowLeft className="text-white" size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="text-primary" size={24} />
            <div>
              <h1 className="text-xl font-bold text-white">Report Detail</h1>
              <p className="text-sm text-gray-400">{unit?.unitCode || 'Laporan P2H'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6">
        <ReportDetail 
          report={report} 
          unit={unit!} 
          operator={operator!} 
          leader={leader}
          supervisor={supervisor}
          results={results} 
          fluidAdditions={fluids}
        />
      </div>
    </main>
  );
}
