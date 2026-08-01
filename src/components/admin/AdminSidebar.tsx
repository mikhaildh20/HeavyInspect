'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Box, ClipboardList, LogOut } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

const sidebarNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User', icon: Users },
  { href: '/admin/units', label: 'Unit', icon: Box },
  { href: '/admin/checklist', label: 'Master Sheet', icon: ClipboardList },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <aside className="flex flex-col w-64 fixed inset-y-0 bg-gray-900 border-r border-gray-800 z-50">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-5 border-b border-gray-800">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-black font-bold text-sm">HI</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-white">HeavyInspect</h1>
                <p className="text-xs text-gray-500">Panel Admin</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {sidebarNav.map((item) => {
              const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-gray-800 space-y-1">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors w-full text-left"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 mb-4">
                <LogOut className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Logout?</h3>
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
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
