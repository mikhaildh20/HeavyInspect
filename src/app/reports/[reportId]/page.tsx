import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { p2hReports, p2hResults, units, users, checklistParameters, fluidAdditions, auditLog } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
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

  const leaderApproval = await db.select({ userId: auditLog.userId })
    .from(auditLog)
    .where(and(eq(auditLog.entityId, id), eq(auditLog.action, 'report.approve'), eq(auditLog.details, 'Approved by Leader')))
    .orderBy(desc(auditLog.createdAt))
    .limit(1);
  
  const supervisorApproval = await db.select({ userId: auditLog.userId })
    .from(auditLog)
    .where(and(eq(auditLog.entityId, id), eq(auditLog.action, 'report.approve'), eq(auditLog.details, 'Approved by Supervisor')))
    .orderBy(desc(auditLog.createdAt))
    .limit(1);

  let leader = null;
  if (leaderApproval[0]) {
    const leaderList = await db.select().from(users).where(eq(users.id, leaderApproval[0].userId)).limit(1);
    leader = leaderList[0] || null;
  }

  let supervisor = null;
  if (supervisorApproval[0]) {
    const supervisorList = await db.select().from(users).where(eq(users.id, supervisorApproval[0].userId)).limit(1);
    supervisor = supervisorList[0] || null;
  }

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
