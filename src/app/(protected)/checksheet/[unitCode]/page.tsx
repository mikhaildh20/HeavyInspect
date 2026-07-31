import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { units, checklistParameters, unitChecklistItems } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { MaintenanceChecksheet } from '@/components/checksheet/MaintenanceChecksheet';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

export default async function ChecksheetPage({ params }: { params: Promise<{ unitCode: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { unitCode } = await params;

  const unitList = await db.select().from(units).where(
    and(eq(units.unitCode, unitCode), isNull(units.deletedAt))
  ).limit(1);
  const unit = unitList[0];
  if (!unit) redirect('/scan');

  const unitSpecific = await db
    .select({
      id: checklistParameters.id,
      category: checklistParameters.category,
      description: checklistParameters.description,
      isActive: checklistParameters.isActive,
    })
    .from(unitChecklistItems)
    .innerJoin(checklistParameters, eq(unitChecklistItems.parameterId, checklistParameters.id))
    .where(and(
      eq(unitChecklistItems.unitId, unit.id),
      isNull(checklistParameters.deletedAt),
      eq(unitChecklistItems.isActive, 1),
    ));

  const checklist = unitSpecific.length > 0
    ? unitSpecific
    : await db.select().from(checklistParameters).where(
        and(eq(checklistParameters.isActive, 1), isNull(checklistParameters.deletedAt))
      );

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/scan" className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
            <ArrowLeft className="text-white" size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <ClipboardCheck className="text-primary" size={24} />
            <div>
              <h1 className="text-xl font-bold text-white">Daily Inspection Sheet</h1>
              <p className="text-sm text-gray-400">{unit.unitCode} - {unit.modelName}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Unit Code</p>
              <p className="font-semibold text-white">{unit.unitCode}</p>
            </div>
            <div>
              <p className="text-gray-400">Model</p>
              <p className="font-semibold text-white">{unit.modelName}</p>
            </div>
            <div>
              <p className="text-gray-400">Date</p>
              <p className="font-semibold text-white">{new Date().toLocaleDateString('en-ID')}</p>
            </div>
            <div>
              <p className="text-gray-400">Last SMR</p>
              <p className="font-semibold text-white">{unit.lastSmr.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <MaintenanceChecksheet
          unitCode={unit.unitCode}
          modelName={unit.modelName}
          reportId={0}
          checklist={checklist}
        />
      </div>
    </main>
  );
}
