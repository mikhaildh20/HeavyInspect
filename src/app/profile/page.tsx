import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { NotificationBell } from '@/components/profile/NotificationBell';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userList = await db.select().from(users).where(eq(users.id, parseInt(session.user.id))).limit(1);
  const user = userList[0];
  if (!user) redirect('/login');

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
            <ArrowLeft className="text-white" size={20} />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <User className="text-primary" size={24} />
            <div>
              <h1 className="text-xl font-bold text-white">My Profile</h1>
              <p className="text-sm text-gray-400">{user.fullName}</p>
            </div>
          </div>
          <NotificationBell />
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <ProfileForm user={{
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          avatarUrl: user.avatarUrl || '',
        }} />
      </div>
    </main>
  );
}
