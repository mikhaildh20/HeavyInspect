import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background pb-[calc(4rem+env(safe-area-inset-bottom))]">
        {children}
        <BottomNav role={session.user.role as string} />
      </div>
    </NotificationProvider>
  );
}
