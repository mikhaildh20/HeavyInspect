import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { checklistCategories } from '@/db/schema';
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
  const { letter, name, sortOrder, isActive } = body;

  const updated = await db.update(checklistCategories)
    .set({
      ...(letter !== undefined && { letter: letter.toUpperCase() }),
      ...(name !== undefined && { name }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
    })
    .where(eq(checklistCategories.id, parseInt(id)))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
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

  const existing = await db.select().from(checklistCategories).where(
    eq(checklistCategories.id, parseInt(id))
  ).limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  await db.update(checklistCategories)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(checklistCategories.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
