import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { checklistParameters, checklistCategories } from '@/db/schema';
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
  const { categoryId, category, description, isActive, sortOrder } = body;

  const updateData: Record<string, unknown> = {};
  if (categoryId !== undefined) {
    updateData.categoryId = categoryId;
    if (!category) {
      const cats = await db.select().from(checklistCategories).where(eq(checklistCategories.id, categoryId)).limit(1);
      if (cats.length > 0) updateData.category = cats[0].name;
    }
  }
  if (category !== undefined) updateData.category = category;
  if (description !== undefined) updateData.description = description;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const updated = await db.update(checklistParameters)
    .set(updateData)
    .where(eq(checklistParameters.id, parseInt(id)))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Parameter not found' }, { status: 404 });
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

  const existing = await db.select().from(checklistParameters).where(
    eq(checklistParameters.id, parseInt(id))
  ).limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Parameter not found' }, { status: 404 });
  }

  await db.update(checklistParameters)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(checklistParameters.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
