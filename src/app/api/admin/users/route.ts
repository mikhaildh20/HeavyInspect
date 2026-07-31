import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { username, fullName, role, password } = body;

  if (!username || !fullName || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existingUser = await db.select().from(users).where(
    and(eq(users.username, username), isNull(users.deletedAt))
  ).limit(1);
  if (existingUser.length > 0) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
  }

  const actualPassword = password || generatePassword();
  const passwordHash = await bcrypt.hash(actualPassword, 12);
  const mustChangePassword = password ? 0 : 1;

  const newUser = await db.insert(users).values({
    username,
    fullName,
    role,
    passwordHash,
    mustChangePassword,
    generatedPassword: password ? null : actualPassword,
  }).returning();

  const { passwordHash: _, ...result } = newUser[0];
  if (!password) {
    (result as Record<string, unknown>).generatedPassword = actualPassword;
  } else {
    delete (result as Record<string, unknown>).generatedPassword;
  }

  return NextResponse.json(result);
}
