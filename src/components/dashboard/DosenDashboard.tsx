import { db } from '@/db';
import { p2hReports, units, users, p2hResults } from '@/db/schema';
import { eq, desc, count, sql, and, isNull } from 'drizzle-orm';
import { BarChart3, CheckCircle, Clock, XCircle, AlertTriangle, Building2 } from 'lucide-react';

export async function DosenDashboard() {
  const totalReports = await db.select({ value: count() }).from(p2hReports);
  const approvedReports = await db.select({ value: count() }).from(p2hReports).where(eq(p2hReports.status, 'Approved'));
  const pendingReports = await db.select({ value: count() }).from(p2hReports).where(
    and(sql`${p2hReports.status} IN ('Submitted', 'PendingSupervisor')`)
  );
  const rejectedReports = await db.select({ value: count() }).from(p2hReports).where(eq(p2hReports.status, 'Rejected'));

  const totalUnits = await db.select({ value: count() }).from(units).where(isNull(units.deletedAt));
  
  const recentReports = await db.select({
    id: p2hReports.id,
    status: p2hReports.status,
    reportDate: p2hReports.reportDate,
    unitCode: units.unitCode,
    operatorName: users.fullName,
  })
  .from(p2hReports)
  .leftJoin(units, eq(p2hReports.unitId, units.id))
  .leftJoin(users, eq(p2hReports.operatorId, users.id))
  .orderBy(desc(p2hReports.reportDate))
  .limit(10);

  const unitStats = await db.select({
    unitCode: units.unitCode,
    modelName: units.modelName,
    reportCount: count(p2hReports.id),
  })
  .from(units)
  .where(isNull(units.deletedAt))
  .leftJoin(p2hReports, eq(units.id, p2hReports.unitId))
  .groupBy(units.id)
  .orderBy(desc(count(p2hReports.id)));

  const stats = [
    { label: 'Total Reports', value: totalReports[0]?.value || 0, icon: BarChart3, color: 'text-blue-400' },
    { label: 'Approved', value: approvedReports[0]?.value || 0, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Pending', value: pendingReports[0]?.value || 0, icon: Clock, color: 'text-yellow-400' },
    { label: 'Rejected', value: rejectedReports[0]?.value || 0, icon: XCircle, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <stat.icon className={stat.color} size={24} />
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="text-primary" />
          Unit Status
        </h2>
        {unitStats.length > 0 ? (
          <div className="space-y-3">
            {unitStats.map((unit) => (
              <div key={unit.unitCode} className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex justify-between items-center">
                <div>
                  <p className="font-medium text-lg">{unit.unitCode}</p>
                  <p className="text-sm text-gray-400">{unit.modelName}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{unit.reportCount}</p>
                  <p className="text-xs text-gray-400">Reports</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No units registered yet.</p>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="text-primary" />
          Recent Activity
        </h2>
        {recentReports.length > 0 ? (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div key={report.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex justify-between items-center">
                <div>
                  <p className="font-medium">{report.unitCode || 'Unknown'}</p>
                  <p className="text-sm text-gray-400">{report.operatorName} - {new Date(report.reportDate).toLocaleDateString('en-ID')}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  report.status === 'Approved' ? 'bg-green-900/50 text-green-400 border border-green-700' :
                  report.status === 'Rejected' ? 'bg-red-900/50 text-red-400 border border-red-700' :
                  'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
                }`}>
                  {report.status === 'Approved' ? 'Approved' :
                   report.status === 'Rejected' ? 'Rejected' :
                   report.status === 'Submitted' ? 'Pending Leader' :
                   'Pending Supervisor'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No recent inspection activity.</p>
          </div>
        )}
      </div>
    </div>
  );
}
