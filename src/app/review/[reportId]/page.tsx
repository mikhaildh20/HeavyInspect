import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { p2hReports, p2hResults, units, users, checklistParameters, fluidAdditions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ReviewForm } from '@/components/p2h/ReviewForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { decryptId } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export default async function ReviewPage({ params }: { params: Promise<{ reportId: string }> }) {
  const session = await auth();
  if (!session?.user?.role || session.user.role === 'operator') {
    redirect('/dashboard');
  }
  
  const { reportId } = await params;
  const id = decryptId(reportId);
  
  if (id === null) return <div>Invalid Report ID</div>;

  // Fetch report details
  const reportList = await db.select().from(p2hReports).where(eq(p2hReports.id, id)).limit(1);
  const report = reportList[0];
  if (!report) return <div>Report not found</div>;

  // Fetch unit
  const unitList = await db.select().from(units).where(eq(units.id, report.unitId)).limit(1);
  const unit = unitList[0];

  // Fetch operator
  const userList = await db.select().from(users).where(eq(users.id, report.operatorId)).limit(1);
  const operator = userList[0];

  // Fetch results
  const results = await db.select({
    condition: p2hResults.condition,
    conditionCode: p2hResults.conditionCode,
    photoUrl: p2hResults.photoUrl,
    notes: p2hResults.notes,
    actionCode: p2hResults.actionCode,
    category: checklistParameters.category,
    description: checklistParameters.description,
  })
  .from(p2hResults)
  .leftJoin(checklistParameters, eq(p2hResults.parameterId, checklistParameters.id))
  .where(eq(p2hResults.reportId, id));

  const fluids = await db.select().from(fluidAdditions).where(eq(fluidAdditions.reportId, id));

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
          <ChevronLeft className="text-white" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Review Laporan P2H</h1>
          <p className="text-sm text-primary font-mono">{unit?.unitCode || 'Unit Tidak Diketahui'}</p>
        </div>
      </header>

      <div className="p-4 md:p-6">
        <ReviewForm 
          report={report} 
          unit={unit} 
          operator={operator} 
          results={results} 
          fluidAdditions={fluids}
          role={session.user.role} 
        />
      </div>
    </main>
  );
}
