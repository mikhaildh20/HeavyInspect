import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { desc, isNull } from 'drizzle-orm';
import { UserList } from '@/components/admin/UserList';

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const allUsers = await db.select({
    id: users.id,
    username: users.username,
    fullName: users.fullName,
    role: users.role,
  })
  .from(users)
  .where(isNull(users.deletedAt))
  .orderBy(desc(users.id));

  return <UserList users={allUsers} />;
}
