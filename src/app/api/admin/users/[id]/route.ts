import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

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
  const { username, fullName, role, resetPassword } = body;

  const setFields: Record<string, unknown> = {};
  if (username) setFields.username = username;
  if (fullName) setFields.fullName = fullName;
  if (role) setFields.role = role;

  if (resetPassword) {
    const newPassword = generatePassword();
    setFields.passwordHash = await bcrypt.hash(newPassword, 12);
    setFields.mustChangePassword = 1;
    setFields.generatedPassword = newPassword;
  }

  const updated = await db.update(users)
    .set(setFields)
    .where(eq(users.id, parseInt(id)))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { passwordHash: _, ...result } = updated[0];
  if (resetPassword) {
    (result as Record<string, unknown>).generatedPassword = setFields.generatedPassword;
  } else {
    delete (result as Record<string, unknown>).generatedPassword;
  }

  return NextResponse.json(result);
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

  const existing = await db.select().from(users).where(
    eq(users.id, parseInt(id))
  ).limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updated = await db.update(users)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(users.id, parseInt(id)))
    .returning();

  return NextResponse.json({ success: true });
}
