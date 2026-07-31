import Link from 'next/link';
import { CalendarClock, ArrowRight, FileText } from 'lucide-react';
import { db } from '@/db';
import { p2hReports, units } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/auth';
import { encryptId } from '@/lib/crypto';

export async function MahasiswaDashboard() {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;

  const recentReports = await db.select({
    id: p2hReports.id,
    unitCode: units.unitCode,
    status: p2hReports.status,
    reportDate: p2hReports.reportDate,
  })
  .from(p2hReports)
  .leftJoin(units, eq(p2hReports.unitId, units.id))
  .where(eq(p2hReports.operatorId, userId))
  .orderBy(desc(p2hReports.reportDate))
  .limit(5);

  const pendingCount = recentReports.filter(r => r.status === 'Submitted' || r.status === 'PendingSupervisor').length;
  const approvedCount = recentReports.filter(r => r.status === 'Approved').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{recentReports.length}</p>
          <p className="text-xs text-gray-400">Total Reports</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
          <p className="text-xs text-gray-400">Pending Review</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CalendarClock className="text-primary" />
          Recent Reports
        </h2>
        
        {recentReports.length > 0 ? (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${encryptId(report.id)}`}
                className="block bg-gray-900 rounded-lg p-4 flex items-center justify-between border border-gray-700 hover:border-gray-500 transition-colors"
              >
                <div>
                  <p className="font-medium text-lg">{report.unitCode || 'Unknown Unit'}</p>
                  <p className="text-sm text-gray-400">{new Date(report.reportDate).toLocaleDateString('en-ID')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    report.status === 'Approved' ? 'bg-green-900/50 text-green-400 border border-green-700' :
                    report.status === 'Rejected' ? 'bg-red-900/50 text-red-400 border border-red-700' :
                    report.status === 'Submitted' ? 'bg-blue-900/50 text-blue-400 border border-blue-700' :
                    report.status === 'PendingSupervisor' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {report.status}
                  </span>
                  <ArrowRight size={16} className="text-gray-500" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No inspection reports yet.</p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Link href="/scan" className="flex-1 btn-primary shadow-lg shadow-primary/20">
          <CalendarClock className="mr-2" size={20} />
          New Inspection
        </Link>
        <Link href="/reports" className="flex-1 btn-glove bg-gray-700 text-white border border-gray-600 hover:bg-gray-600">
          <FileText className="mr-2" size={20} />
          View All Reports
        </Link>
      </div>
    </div>
  );
}
