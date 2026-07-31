import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { units } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { UnitsList } from '@/components/units/UnitsList';
import { ArrowLeft, Truck } from 'lucide-react';
import Link from 'next/link';

export default async function UnitsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const allUnits = await db.select().from(units).where(
    and(eq(units.isActive, true), isNull(units.deletedAt))
  );

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
            <ArrowLeft className="text-white" size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <Truck className="text-primary" size={24} />
            <div>
              <h1 className="text-xl font-bold text-white">Unit</h1>
              <p className="text-sm text-gray-400">{allUnits.length} unit terdaftar</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-1">Daftar Unit</h2>
          <p className="text-sm text-gray-400">Kelola unit alat berat dan Master Sheet checklist per unit</p>
        </div>
        <UnitsList units={allUnits} role={session.user.role as string} />
      </div>
    </main>
  );
}
