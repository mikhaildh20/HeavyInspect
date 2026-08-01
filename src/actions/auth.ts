'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signIn } from '@/auth';

export async function changePassword(userId: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db.update(users)
    .set({
      passwordHash,
      mustChangePassword: false,
      generatedPassword: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, parseInt(userId)));

  const userList = await db.select({ username: users.username }).from(users).where(eq(users.id, parseInt(userId))).limit(1);
  if (userList.length > 0) {
    await signIn('credentials', {
      username: userList[0].username,
      password: newPassword,
      redirectTo: '/dashboard',
    });
  }
}
