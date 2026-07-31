import { auth } from '@/auth';
import { db } from '@/db';
import { units, users, p2hReports, auditLog } from '@/db/schema';
import { eq, desc, count, and, isNull } from 'drizzle-orm';
import { encryptId } from '@/lib/crypto';
import Link from 'next/link';
import {
  Box,
  Users,
  FileText,
  Clock,
  ClipboardList,
  ArrowRight,
  Eye,
  Activity,
  User,
  Settings,
} from 'lucide-react';

const statusStyles: Record<string, string> = {
  Approved: 'bg-green-900/50 text-green-400 border border-green-700',
  Submitted: 'bg-yellow-900/50 text-yellow-400 border border-yellow-700',
  PendingSupervisor: 'bg-yellow-900/50 text-yellow-400 border border-yellow-700',
  Draft: 'bg-gray-700 text-gray-400 border border-gray-600',
  Rejected: 'bg-red-900/50 text-red-400 border border-red-700',
};

const statusLabels: Record<string, string> = {
  Submitted: 'Menunggu Leader',
  PendingSupervisor: 'Menunggu Dosen',
  Draft: 'Draft',
  Approved: 'Disetujui',
  Rejected: 'Ditolak',
};

export default async function AdminDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || 'Admin';
  const avatarUrl = (session?.user as unknown as Record<string, unknown>)?.avatarUrl as string || '';

  // --- Stats ---
  const [unitCount] = await db
    .select({ value: count() })
    .from(units)
    .where(and(eq(units.isActive, true), isNull(units.deletedAt)));

  const [userCount] = await db
    .select({ value: count() })
    .from(users)
    .where(and(eq(users.isActive, true), isNull(users.deletedAt)));

  const [reportCount] = await db
    .select({ value: count() })
    .from(p2hReports)
    .where(eq(p2hReports.isActive, true));

  const [pendingCount] = await db
    .select({ value: count() })
    .from(p2hReports)
    .where(
      and(
        eq(p2hReports.isActive, true),
        // Drizzle doesn't have an inArray in select directly, use or
      )
    );

  // Pending = Submitted + PendingSupervisor
  const [pendingSubmitted] = await db
    .select({ value: count() })
    .from(p2hReports)
    .where(and(eq(p2hReports.isActive, true), eq(p2hReports.status, 'Submitted')));

  const [pendingSupervisor] = await db
    .select({ value: count() })
    .from(p2hReports)
    .where(and(eq(p2hReports.isActive, true), eq(p2hReports.status, 'PendingSupervisor')));

  const totalPending = (pendingSubmitted?.value || 0) + (pendingSupervisor?.value || 0);

  // --- Recent Reports ---
  const recentReports = await db
    .select({
      id: p2hReports.id,
      status: p2hReports.status,
      reportDate: p2hReports.reportDate,
      unitCode: units.unitCode,
      operatorName: users.fullName,
      createdAt: p2hReports.createdAt,
    })
    .from(p2hReports)
    .leftJoin(units, eq(p2hReports.unitId, units.id))
    .leftJoin(users, eq(p2hReports.operatorId, users.id))
    .where(eq(p2hReports.isActive, true))
    .orderBy(desc(p2hReports.createdAt))
    .limit(10);

  // --- Audit Log ---
  const recentAudit = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      details: auditLog.details,
      createdAt: auditLog.createdAt,
      userName: users.fullName,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(10);

  const stats = [
    {
      label: 'Total Unit',
      value: unitCount?.value || 0,
      icon: Box,
      color: 'text-blue-400',
      bg: 'bg-blue-900/50',
    },
    {
      label: 'Total User',
      value: userCount?.value || 0,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-900/50',
    },
    {
      label: 'Total Laporan',
      value: reportCount?.value || 0,
      icon: FileText,
      color: 'text-green-400',
      bg: 'bg-green-900/50',
    },
    {
      label: 'Menunggu Persetujuan',
      value: totalPending,
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/50',
    },
  ];

  const quickLinks = [
    {
      label: 'Kelola User',
      description: 'Kelola akun operator, instruktur, dan dosen',
      href: '/admin/users',
      icon: Users,
    },
    {
      label: 'Kelola Unit',
      description: 'Kelola unit heavy equipment',
      href: '/admin/units',
      icon: Box,
    },
    {
      label: 'Master Sheet',
      description: 'Kelola parameter checklist',
      href: '/admin/checklist',
      icon: ClipboardList,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/profile" className="relative group">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="h-12 w-12 rounded-full object-cover border-2 border-gray-600 group-hover:border-primary transition-colors" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600 group-hover:border-primary transition-colors">
                <User size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
              </div>
            )}
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Selamat Datang, {userName}
            </h1>
            <p className="text-sm text-gray-400">Dashboard Admin</p>
          </div>
        </div>
        <Link
          href="/admin/users"
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
        >
          <Settings size={18} />
          <span className="hidden sm:inline">Kelola Data</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 group-hover:bg-primary/10 transition-colors">
                    <Icon size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                    {link.label}
                  </h3>
                </div>
                <p className="text-sm text-gray-400 ml-13">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Reports + Audit Log side by side on desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Reports - takes 2 cols */}
        <div className="xl:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Laporan Terkini
            </h2>
            <Link
              href="/reports"
              className="text-sm text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>

          {recentReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Unit</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Operator</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-300">
                        {new Date(report.reportDate).toLocaleDateString('en-ID')}
                      </td>
                      <td className="px-6 py-3 text-sm text-white font-medium">
                        {report.unitCode || '—'}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-400">
                        {report.operatorName || '—'}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[report.status] || statusStyles.Draft}`}>
                          {statusLabels[report.status] || report.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link
                          href={`/review/${encryptId(report.id)}`}
                          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors"
                        >
                          <Eye size={14} />
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <FileText size={40} className="mx-auto mb-3 text-gray-600" />
              <p>Belum ada laporan.</p>
            </div>
          )}
        </div>

        {/* Audit Log - takes 1 col */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Aktivitas Terbaru
            </h2>
          </div>

          {recentAudit.length > 0 ? (
            <div className="divide-y divide-gray-700 max-h-[480px] overflow-y-auto">
              {recentAudit.map((entry) => (
                <div key={entry.id} className="px-6 py-3 hover:bg-gray-750 transition-colors">
                  <p className="text-sm text-white font-medium">{entry.userName || 'System'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {entry.action} — {entry.entity}
                    {entry.entityId ? ` #${entry.entityId}` : ''}
                  </p>
                  {entry.details && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.details}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    {entry.createdAt ? new Date(entry.createdAt).toLocaleString('en-ID') : '—'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <Activity size={40} className="mx-auto mb-3 text-gray-600" />
              <p>Belum ada aktivitas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
