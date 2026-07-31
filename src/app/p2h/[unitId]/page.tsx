import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { units, checklistParameters, unitChecklistItems } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { P2HForm } from '@/components/p2h/P2HForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function P2HPage({ params }: { params: Promise<{ unitId: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'operator') {
    redirect('/dashboard');
  }
  
  const { unitId } = await params;

  const unitList = await db.select().from(units).where(
    and(eq(units.unitCode, unitId), isNull(units.deletedAt))
  ).limit(1);
  const unit = unitList[0];
  if (!unit) redirect('/scan');

  const unitSpecific = await db
    .select({
      id: checklistParameters.id,
      category: checklistParameters.category,
      description: checklistParameters.description,
    })
    .from(unitChecklistItems)
    .innerJoin(checklistParameters, eq(unitChecklistItems.parameterId, checklistParameters.id))
    .where(and(
      eq(unitChecklistItems.unitId, unit.id),
      isNull(checklistParameters.deletedAt),
      eq(unitChecklistItems.isActive, true),
    ));

  const checklist = unitSpecific.length > 0
    ? unitSpecific
    : await db.select({ id: checklistParameters.id, category: checklistParameters.category, description: checklistParameters.description })
        .from(checklistParameters)
        .where(and(eq(checklistParameters.isActive, true), isNull(checklistParameters.deletedAt)));

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-4 flex items-center gap-4">
        <Link href="/scan" className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
          <ChevronLeft className="text-white" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Inspeksi Unit</h1>
          <p className="text-sm text-primary font-mono">{unit.unitCode} - {unit.modelName}</p>
        </div>
      </header>

      <div className="p-4 md:p-6">
        <P2HForm
          unitId={unit.unitCode}
          modelName={unit.modelName}
          checklist={checklist}
          lastSmr={unit.lastSmr}
          serialNumber={unit.serialNumber || ''}
          woJono={unit.woJono || ''}
          zone={unit.zone || ''}
          inspectionStart={unit.inspectionStart || ''}
        />
      </div>
    </main>
  );
}
