import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { units } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { unitCode, modelName, lastSmr, serialNumber, woJono, zone, inspectionStart, isActive } = body;

  const updated = await db.update(units)
    .set({
      unitCode,
      modelName,
      lastSmr,
      serialNumber: serialNumber || '',
      woJono: woJono || '',
      zone: zone || '',
      inspectionStart: inspectionStart || '',
      isActive,
    })
    .where(eq(units.id, parseInt(id)))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
  }

  return NextResponse.json(updated[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.select().from(units).where(
    eq(units.id, parseInt(id))
  ).limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
  }

  await db.update(units)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(units.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
