'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Box, ClipboardList, LayoutDashboard, ArrowLeft } from 'lucide-react';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User', icon: Users },
  { href: '/admin/units', label: 'Unit', icon: Box },
  { href: '/admin/checklist', label: 'Master Sheet', icon: ClipboardList },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-2">
      <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-800 transition-colors shrink-0">
        <ArrowLeft className="text-white" size={20} />
      </Link>
      {adminNav.map((item) => {
        const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              isActive 
                ? 'bg-primary text-black font-medium' 
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
