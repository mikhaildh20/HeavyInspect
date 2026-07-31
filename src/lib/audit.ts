'use server';

import { db } from '@/db';
import { auditLog } from '@/db/schema';

export type AuditAction = 
  | 'user.login'
  | 'user.logout'
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'unit.create'
  | 'unit.update'
  | 'unit.delete'
  | 'checklist.create'
  | 'checklist.update'
  | 'checklist.delete'
  | 'report.create'
  | 'report.submit'
  | 'report.approve'
  | 'report.reject';

export async function logAuditEvent(
  userId: number,
  action: AuditAction,
  entity: string,
  entityId?: number,
  details?: string,
  ipAddress?: string
) {
  try {
    await db.insert(auditLog).values({
      userId,
      action,
      entity,
      entityId: entityId || null,
      details: details || null,
      ipAddress: ipAddress || null,
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
