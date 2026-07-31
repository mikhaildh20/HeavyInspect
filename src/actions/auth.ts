'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

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
}
