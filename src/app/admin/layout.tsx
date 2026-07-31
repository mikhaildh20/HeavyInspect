import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-bold text-white hidden md:block">Admin Panel</h1>
            <AdminNav />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
