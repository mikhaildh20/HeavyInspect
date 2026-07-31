import { AdminNav } from '@/components/admin/AdminNav';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <header className="sticky top-0 z-40 lg:hidden bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
          <div className="px-4 py-4">
            <AdminNav />
          </div>
        </header>
        <main className="flex-1 px-4 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
