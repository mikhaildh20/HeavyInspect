import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { units } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allUnits = await db.select().from(units).where(
    and(eq(units.isActive, true), isNull(units.deletedAt))
  );

  return NextResponse.json(allUnits);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'leader' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { unitCode, modelName, lastSmr, serialNumber, woJono, zone, inspectionStart, isActive } = body;

  if (!unitCode || !modelName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existingUnit = await db.select().from(units).where(
    and(eq(units.unitCode, unitCode), isNull(units.deletedAt))
  ).limit(1);
  if (existingUnit.length > 0) {
    return NextResponse.json({ error: 'Unit code already exists' }, { status: 400 });
  }

  const newUnit = await db.insert(units).values({
    unitCode,
    modelName,
    lastSmr: lastSmr || 0,
    serialNumber: serialNumber || '',
    woJono: woJono || '',
    zone: zone || '',
    inspectionStart: inspectionStart || '',
    isActive: isActive ?? true,
  }).returning();

  return NextResponse.json(newUnit[0]);
}
