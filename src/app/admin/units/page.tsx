import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { units } from '@/db/schema';
import { desc, isNull } from 'drizzle-orm';
import { UnitList } from '@/components/admin/UnitList';

export default async function AdminUnitsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const allUnits = await db.select({
    id: units.id,
    unitCode: units.unitCode,
    modelName: units.modelName,
    lastSmr: units.lastSmr,
    serialNumber: units.serialNumber,
    woJono: units.woJono,
    zone: units.zone,
    inspectionStart: units.inspectionStart,
    isActive: units.isActive,
  })
  .from(units)
  .where(isNull(units.deletedAt))
  .orderBy(desc(units.id));

  return <UnitList units={allUnits} />;
}
