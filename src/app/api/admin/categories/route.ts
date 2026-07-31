import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { checklistCategories } from '@/db/schema';
import { asc, eq, isNull } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allCategories = await db.select().from(checklistCategories)
    .where(isNull(checklistCategories.deletedAt))
    .orderBy(asc(checklistCategories.sortOrder));
  return NextResponse.json(allCategories);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { letter, name, sortOrder, isActive } = body;

  if (!letter || !name) {
    return NextResponse.json({ error: 'Letter and name are required' }, { status: 400 });
  }

  const existing = await db.select().from(checklistCategories).where(
    eq(checklistCategories.letter, letter.toUpperCase())
  ).limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: `Category ${letter.toUpperCase()} already exists` }, { status: 409 });
  }

  const newCategory = await db.insert(checklistCategories).values({
    letter: letter.toUpperCase(),
    name,
    sortOrder: sortOrder ?? 0,
    isActive: isActive ?? 1,
  }).returning();

  return NextResponse.json(newCategory[0]);
}
