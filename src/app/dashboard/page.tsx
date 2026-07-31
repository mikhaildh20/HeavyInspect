import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MahasiswaDashboard } from '@/components/dashboard/MahasiswaDashboard';
import { ApprovalDashboard } from '@/components/dashboard/ApprovalDashboard';
import { DosenDashboard } from '@/components/dashboard/DosenDashboard';
import { NotificationBell } from '@/components/profile/NotificationBell';
import Link from 'next/link';
import { Settings, User } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  const userName = session?.user?.name || 'User';
  const avatarUrl = (session?.user as unknown as Record<string, unknown>)?.avatarUrl as string || '';

const roleLabels: Record<string, string> = {
  operator: 'Mahasiswa',
  leader: 'Instruktur',
  supervisor: 'Dosen',
  admin: 'Admin',
};

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
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
            <p className="text-sm text-gray-400">
              Dasbor {roleLabels[role || ''] || role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          {role === 'admin' && (
            <Link
              href="/admin/users"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Settings size={18} />
              Kelola Data
            </Link>
          )}
        </div>
      </div>

      {role === 'operator' && <MahasiswaDashboard />}
      {role === 'leader' && <ApprovalDashboard role="leader" />}
      {role === 'supervisor' && (
        <>
          <ApprovalDashboard role="supervisor" />
          <DosenDashboard />
        </>
      )}
      {role === 'admin' && <ApprovalDashboard role="admin" />}
    </main>
  );
}
