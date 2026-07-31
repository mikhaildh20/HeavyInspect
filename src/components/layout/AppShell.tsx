'use client';

import { usePathname } from 'next/navigation';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { BottomNav } from '@/components/layout/BottomNav';

const HIDDEN_ROUTES = ['/login', '/change-password', '/admin'];

interface AppShellProps {
  children: React.ReactNode;
  role?: string;
}

export function AppShell({ children, role }: AppShellProps) {
  const pathname = usePathname();
  const isHidden = HIDDEN_ROUTES.some(r => pathname.startsWith(r));
  const showNav = role && !isHidden;

  return (
    <NotificationProvider>
      <div className={showNav ? 'min-h-screen bg-background pb-[calc(4rem+env(safe-area-inset-bottom))]' : 'min-h-screen bg-background'}>
        {children}
        {showNav && <BottomNav role={role} />}
      </div>
    </NotificationProvider>
  );
}
