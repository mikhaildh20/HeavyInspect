import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminChecklistClient } from './AdminChecklistClient';

export default async function AdminChecklistPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <AdminChecklistClient />;
}
