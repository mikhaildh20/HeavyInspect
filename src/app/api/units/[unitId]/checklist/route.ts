import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { unitChecklistItems, checklistParameters } from '@/db/schema';
import { eq, and, asc, isNull } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ unitId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { unitId } = await params;

  const items = await db
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
      eq(unitChecklistItems.unitId, parseInt(unitId)),
      isNull(checklistParameters.deletedAt),
      eq(unitChecklistItems.isActive, true),
    ))
    .orderBy(asc(unitChecklistItems.sortOrder));

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'leader' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { unitId, parameterId, sortOrder } = body;

  if (!unitId || !parameterId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(unitChecklistItems)
    .where(
      and(
        eq(unitChecklistItems.unitId, unitId),
        eq(unitChecklistItems.parameterId, parameterId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: 'Parameter already assigned to this unit' }, { status: 409 });
  }

  const newItem = await db
    .insert(unitChecklistItems)
    .values({
      unitId,
      parameterId,
      sortOrder: sortOrder ?? 0,
    })
    .returning();

  return NextResponse.json(newItem[0]);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'leader' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const existing = await db.select().from(unitChecklistItems).where(
    eq(unitChecklistItems.id, id)
  ).limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  await db.update(unitChecklistItems)
    .set({ isActive: false })
    .where(eq(unitChecklistItems.id, id));

  return NextResponse.json({ success: true });
}
