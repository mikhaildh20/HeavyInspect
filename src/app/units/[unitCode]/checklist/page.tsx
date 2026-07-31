import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { units, unitChecklistItems, checklistParameters } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { UnitChecklistManager } from '@/components/units/UnitChecklistManager';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

export default async function UnitChecklistPage({ params }: { params: Promise<{ unitCode: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'leader' && session.user.role !== 'admin') redirect('/dashboard');

  const { unitCode } = await params;

  const unitList = await db.select().from(units).where(
    and(eq(units.unitCode, unitCode), isNull(units.deletedAt))
  ).limit(1);
  const unit = unitList[0];
  if (!unit) redirect('/units');

  const assignedItems = await db
    .select({
      id: unitChecklistItems.id,
      unitId: unitChecklistItems.unitId,
      parameterId: unitChecklistItems.parameterId,
      sortOrder: unitChecklistItems.sortOrder,
      isActive: unitChecklistItems.isActive,
      category: checklistParameters.category,
      description: checklistParameters.description,
    })
    .from(unitChecklistItems)
    .innerJoin(checklistParameters, eq(unitChecklistItems.parameterId, checklistParameters.id))
    .where(and(
      eq(unitChecklistItems.unitId, unit.id),
      isNull(checklistParameters.deletedAt),
    ));

  const allParameters = await db.select().from(checklistParameters).where(
    and(eq(checklistParameters.isActive, true), isNull(checklistParameters.deletedAt))
  );

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/units" className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
            <ArrowLeft className="text-white" size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <ClipboardCheck className="text-primary" size={24} />
            <div>
              <h1 className="text-xl font-bold text-white">Master Sheet</h1>
              <p className="text-sm text-gray-400">Checklist parameter untuk {unit.unitCode} — {unit.modelName}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <UnitChecklistManager
          unitId={unit.id}
          unitCode={unit.unitCode}
          assignedItems={assignedItems}
          allParameters={allParameters}
        />
      </div>
    </main>
  );
}
