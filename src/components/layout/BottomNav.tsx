'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ScanLine, History, ClipboardList, Truck, Settings, BarChart2, Activity, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

interface BottomNavProps {
  role: string;
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  let navItems = [];

  switch (role) {
    case 'operator':
      navItems = [
        { label: 'Beranda', href: '/dashboard', icon: Home },
        { label: 'Scan', href: '/scan', icon: ScanLine },
        { label: 'Laporan', href: '/reports', icon: History },
        { label: 'Profil', href: '/profile', icon: User },
      ];
      break;
    case 'leader':
      navItems = [
        { label: 'Beranda', href: '/dashboard', icon: Home },
        { label: 'Laporan', href: '/reports', icon: History },
        { label: 'Unit', href: '/units', icon: Truck },
        { label: 'Profil', href: '/profile', icon: User },
      ];
      break;
    case 'supervisor':
      navItems = [
        { label: 'Beranda', href: '/dashboard', icon: Home },
        { label: 'Laporan', href: '/reports', icon: BarChart2 },
        { label: 'Profil', href: '/profile', icon: User },
      ];
      break;
    case 'admin':
      navItems = [
        { label: 'Beranda', href: '/dashboard', icon: Home },
        { label: 'Pengguna', href: '/admin/users', icon: ClipboardList },
        { label: 'Unit', href: '/admin/units', icon: Truck },
        { label: 'Master', href: '/admin/checklist', icon: ClipboardList },
        { label: 'Profil', href: '/profile', icon: User },
      ];
      break;
    default:
      return null;
  }

  return (
    <>
      <nav className="fixed bottom-0 w-full bg-gray-900 border-t border-gray-800 pb-[env(safe-area-inset-bottom)] z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : ''} />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-gray-400 hover:text-red-400"
          >
            <LogOut size={24} strokeWidth={2} />
            <span className="text-[10px] font-medium tracking-wide">Keluar</span>
          </button>
        </div>
      </nav>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 mb-4">
                <LogOut className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Keluar?</h3>
              <p className="text-sm text-gray-400 mb-6">
                Anda akan logout dan diarahkan ke halaman login.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600"
                >
                  Batal
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
