import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { and, eq, isNull, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

interface ImportRow {
  username: string;
  fullName: string;
  role: string;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { rows } = body as { rows: ImportRow[] };

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
  }

  if (rows.length > 100) {
    return NextResponse.json({ error: 'Maximum 100 users per import' }, { status: 400 });
  }

  const validRoles = ['operator', 'leader', 'supervisor'];
  const errors: { row: number; message: string }[] = [];
  const created: { username: string; fullName: string; role: string; generatedPassword: string }[] = [];

  const usernames = rows.map(r => r.username?.trim()).filter(Boolean);
  if (usernames.length > 0) {
    const existing = await db
      .select({ username: users.username })
      .from(users)
      .where(and(inArray(users.username, usernames), isNull(users.deletedAt)));
    const existingSet = new Set(existing.map(u => u.username));
    for (let i = 0; i < rows.length; i++) {
      if (existingSet.has(rows[i].username?.trim())) {
        errors.push({ row: i + 1, message: `Username "${rows[i].username}" already exists` });
      }
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const username = row.username?.trim();
    const fullName = row.fullName?.trim();
    const role = row.role?.trim().toLowerCase();

    if (!username || !fullName || !role) {
      errors.push({ row: i + 1, message: 'Missing username, fullName, or role' });
      continue;
    }

    if (!validRoles.includes(role)) {
      errors.push({ row: i + 1, message: `Invalid role "${role}". Must be: operator, leader, or supervisor` });
      continue;
    }

    if (errors.some(e => e.row === i + 1)) continue;

    const generatedPw = generatePassword();
    const passwordHash = await bcrypt.hash(generatedPw, 12);

    await db.insert(users).values({
      username,
      fullName,
      role: role as 'operator' | 'leader' | 'supervisor',
      passwordHash,
      mustChangePassword: true,
      generatedPassword: generatedPw,
    });

    created.push({ username, fullName, role, generatedPassword: generatedPw });
  }

  return NextResponse.json({ created, errors });
}
