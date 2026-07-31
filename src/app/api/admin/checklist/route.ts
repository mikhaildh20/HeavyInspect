import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { checklistParameters, checklistCategories } from '@/db/schema';
import { eq, asc, isNull } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allParams = await db.select().from(checklistParameters)
    .where(isNull(checklistParameters.deletedAt))
    .orderBy(asc(checklistParameters.sortOrder));
  return NextResponse.json(allParams);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { categoryId, category, description, isActive, sortOrder } = body;

  if (!description) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  }

  let legacyCategory = category || '';
  if (categoryId && !category) {
    const cats = await db.select().from(checklistCategories).where(
      eq(checklistCategories.id, categoryId)
    ).limit(1);
    if (cats.length > 0) legacyCategory = cats[0].name;
  }

  const newParam = await db.insert(checklistParameters).values({
    categoryId: categoryId ?? null,
    category: legacyCategory,
    description,
    sortOrder: sortOrder ?? 0,
    isActive: isActive ?? true,
  }).returning();

  return NextResponse.json(newParam[0]);
}
