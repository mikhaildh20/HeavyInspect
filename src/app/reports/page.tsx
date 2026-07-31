import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { p2hReports, units, users } from '@/db/schema';
import { eq, desc, or } from 'drizzle-orm';
import { ReportList } from '@/components/reports/ReportList';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { encryptId } from '@/lib/crypto';

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const role = session.user.role;
  const userId = parseInt(session.user.id!);

  let reports;

  if (role === 'operator') {
    reports = await db.select({
      id: p2hReports.id,
      unitCode: units.unitCode,
      reportDate: p2hReports.reportDate,
      status: p2hReports.status,
      operatorName: users.fullName,
    })
    .from(p2hReports)
    .leftJoin(units, eq(p2hReports.unitId, units.id))
    .leftJoin(users, eq(p2hReports.operatorId, users.id))
    .where(eq(p2hReports.operatorId, userId))
    .orderBy(desc(p2hReports.reportDate));
  } else if (role === 'leader') {
    reports = await db.select({
      id: p2hReports.id,
      unitCode: units.unitCode,
      reportDate: p2hReports.reportDate,
      status: p2hReports.status,
      operatorName: users.fullName,
    })
    .from(p2hReports)
    .leftJoin(units, eq(p2hReports.unitId, units.id))
    .leftJoin(users, eq(p2hReports.operatorId, users.id))
    .where(or(
      eq(p2hReports.status, 'Submitted'),
      eq(p2hReports.status, 'PendingSupervisor'),
      eq(p2hReports.status, 'Approved'),
      eq(p2hReports.status, 'Rejected'),
    ))
    .orderBy(desc(p2hReports.reportDate));
  } else {
    reports = await db.select({
      id: p2hReports.id,
      unitCode: units.unitCode,
      reportDate: p2hReports.reportDate,
      status: p2hReports.status,
      operatorName: users.fullName,
    })
    .from(p2hReports)
    .leftJoin(units, eq(p2hReports.unitId, units.id))
    .leftJoin(users, eq(p2hReports.operatorId, users.id))
    .orderBy(desc(p2hReports.reportDate));
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
            <ArrowLeft className="text-white" size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="text-primary" size={24} />
            <div>
              <h1 className="text-xl font-bold text-white">Report History</h1>
              <p className="text-sm text-gray-400">{reports.length} reports</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <ReportList reports={reports.map(r => ({ ...r, encryptedId: encryptId(r.id) }))} role={role} />
      </div>
    </main>
  );
}
