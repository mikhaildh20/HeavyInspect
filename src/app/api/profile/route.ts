import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { fullName, avatarUrl } = await request.json();

  if (avatarUrl !== undefined) {
    await db.update(users).set({
      avatarUrl: avatarUrl || '',
      updatedAt: new Date(),
    }).where(eq(users.id, parseInt(session.user.id)));
  }

  if (fullName !== undefined) {
    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }
    await db.update(users).set({
      fullName: fullName.trim(),
      updatedAt: new Date(),
    }).where(eq(users.id, parseInt(session.user.id)));
  }

  return NextResponse.json({ success: true });
}
