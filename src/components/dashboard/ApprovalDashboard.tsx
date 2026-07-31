import { AlertCircle, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/db';
import { p2hReports, units, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { encryptId } from '@/lib/crypto';

interface ApprovalDashboardProps {
  role: 'leader' | 'supervisor' | 'admin';
}

type ReportRow = {
  id: number;
  status: string;
  reportDate: string;
  unitCode: string | null;
  operatorName: string | null;
};

export async function ApprovalDashboard({ role }: ApprovalDashboardProps) {
  let reportsList: ReportRow[] = [];
  
  if (role === 'leader') {
    reportsList = await db.select({
      id: p2hReports.id,
      status: p2hReports.status,
      reportDate: p2hReports.reportDate,
      unitCode: units.unitCode,
      operatorName: users.fullName,
    })
    .from(p2hReports)
    .leftJoin(units, eq(p2hReports.unitId, units.id))
    .leftJoin(users, eq(p2hReports.operatorId, users.id))
    .where(eq(p2hReports.status, 'Submitted'))
    .orderBy(desc(p2hReports.reportDate));
  } else if (role === 'supervisor') {
    reportsList = await db.select({
      id: p2hReports.id,
      status: p2hReports.status,
      reportDate: p2hReports.reportDate,
      unitCode: units.unitCode,
      operatorName: users.fullName,
    })
    .from(p2hReports)
    .leftJoin(units, eq(p2hReports.unitId, units.id))
    .leftJoin(users, eq(p2hReports.operatorId, users.id))
    .where(eq(p2hReports.status, 'PendingSupervisor'))
    .orderBy(desc(p2hReports.reportDate));
  }

  const queue = reportsList.map(r => ({
    id: r.id,
    unit: r.unitCode || 'Unknown',
    mechanic: r.operatorName || 'Unknown',
    status: r.status,
    time: new Date(r.reportDate).toLocaleDateString('en-ID'),
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="text-primary" />
          Pending Approval
        </h2>
        
        {queue.length > 0 ? (
          <div className="space-y-3">
            {queue.map((item) => (
              <div key={item.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-lg">{item.unit}</p>
                    {item.status === 'Urgent' && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-danger/20 text-danger rounded-full border border-danger/30">
                        <AlertCircle size={12} />
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">Inspector: {item.mechanic} - {item.time}</p>
                </div>
                
                <Link href={`/review/${encryptId(item.id)}`} className="btn-glove bg-gray-700 hover:bg-gray-600 text-white px-6 w-full sm:w-auto border border-gray-600">
                  Review
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No reports pending your approval.</p>
          </div>
        )}
      </div>

      <Link href="/reports" className="flex items-center justify-center gap-2 w-full btn-glove bg-gray-700 text-white border border-gray-600 hover:bg-gray-600">
        <FileText size={20} />
        View All Reports
      </Link>
    </div>
  );
}
