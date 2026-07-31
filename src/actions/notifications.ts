'use server';

import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { auth } from '@/auth';

export async function pushNotification(
  userId: number,
  type: 'success' | 'error' | 'info' | 'warning',
  title: string,
  message: string,
  actionUrl?: string
) {
  await db.insert(notifications).values({
    userId,
    type,
    title,
    message,
    actionUrl: actionUrl || null,
  });
}

export async function getMyNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, parseInt(session.user.id)))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return rows.map((r) => ({
    id: String(r.id),
    type: r.type as 'success' | 'error' | 'info' | 'warning',
    title: r.title,
    message: r.message,
    read: r.isRead === true,
    timestamp: r.createdAt,
    actionUrl: r.actionUrl || undefined,
  }));
}

export async function markNotificationRead(id: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, parseInt(id)));
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, parseInt(session.user.id)));
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      eq(notifications.userId, parseInt(session.user.id))
    );

  return rows[0]?.count || 0;
}
