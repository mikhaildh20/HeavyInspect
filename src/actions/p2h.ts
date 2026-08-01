'use server';

import { db } from '@/db';
import { p2hReports, p2hResults, units, users, checklistParameters, fluidAdditions } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { logAuditEvent } from '@/lib/audit';
import { encryptId } from '@/lib/crypto';
import { pushNotification } from './notifications';

export async function submitP2HReport(payload: {
  unitCode: string;
  hm: string;
  serialNumber: string;
  woJono: string;
  zone: string;
  inspectionStart: string;
  checklist: Record<string, { status: string; photo?: string | null; priorityCondition?: string | null; actionCode?: string | null; notes?: string | null }>;
  fluids: { type: string; quantity: number }[];
  signature: string;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  gpsAccuracy: number | null;
  gpsTimestamp: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  // Find user
  const userList = await db.select().from(users).where(
    and(eq(users.id, parseInt(session.user.id)), isNull(users.deletedAt))
  ).limit(1);
  const operator = userList[0];
  if (!operator || operator.role !== 'operator') throw new Error('Invalid role');

  // Find unit
  let unitList = await db.select().from(units).where(
    and(eq(units.unitCode, payload.unitCode), isNull(units.deletedAt))
  ).limit(1);
  let unit = unitList[0];
  
  if (!unit) {
    return { error: `Unit ${payload.unitCode} tidak terdaftar dalam sistem. Hubungi administrator.` };
  }

  // HM Validation (BR-002)
  const newHm = Number(payload.hm);
  if (isNaN(newHm) || newHm < 0) {
    return { error: 'HM harus berupa angka positif' };
  }
  if (newHm < unit.lastSmr) {
    return { error: `Nilai HM tidak boleh lebih rendah dari HM sebelumnya (${unit.lastSmr})` };
  }

  await db.update(units).set({ lastSmr: newHm }).where(eq(units.id, unit.id));

  // Create Report
  const reportRes = await db.insert(p2hReports).values({
    unitId: unit.id,
    operatorId: operator.id,
    reportDate: new Date().toISOString(),
    status: 'Submitted',
    hm: newHm,
    serialNumber: payload.serialNumber || unit.serialNumber,
    woJono: payload.woJono || unit.woJono,
    zone: payload.zone || unit.zone,
    inspectionStart: payload.inspectionStart,
    operatorSig: payload.signature,
    gpsLatitude: payload.gpsLatitude,
    gpsLongitude: payload.gpsLongitude,
    gpsAccuracy: payload.gpsAccuracy,
    gpsTimestamp: payload.gpsTimestamp,
  }).returning();
  
  const report = reportRes[0];

  // Map and Insert Results
  for (const [key, val] of Object.entries(payload.checklist)) {
    const paramId = parseInt(key);
    if (isNaN(paramId)) continue;

    const paramList = await db.select().from(checklistParameters).where(
      and(eq(checklistParameters.id, paramId), isNull(checklistParameters.deletedAt))
    ).limit(1);
    const param = paramList[0];
    if (!param) continue;

    await db.insert(p2hResults).values({
      reportId: report.id,
      parameterId: param.id,
      condition: val.status === 'G' ? 'OK' : 'NOT OK',
      conditionCode: val.status as 'G' | 'B' | 'U',
      priorityCondition: val.priorityCondition || null,
      actionCode: val.actionCode || null,
      photoUrl: val.photo || null,
      notes: val.notes || null,
    });
  }

  if (payload.fluids && payload.fluids.length > 0) {
    const validFluids = payload.fluids.filter(f => f.type && f.quantity > 0);
    if (validFluids.length > 0) {
      await db.insert(fluidAdditions).values(
        validFluids.map(f => ({
          reportId: report.id,
          fluidType: f.type,
          quantity: f.quantity,
        }))
      );
    }
  }

  revalidatePath('/dashboard');
  
  await logAuditEvent(operator.id, 'report.create', 'p2h_reports', report.id, `Report created for unit ${payload.unitCode}`);

  const leaders = await db.select({ id: users.id }).from(users).where(eq(users.role, 'leader'));
  for (const leader of leaders) {
    await pushNotification(leader.id, 'info', 'Laporan Baru', `Laporan P2H dari ${operator.fullName} untuk unit ${payload.unitCode} menunggu persetujuan.`, `/review/${encryptId(report.id)}`);
  }
  
  return { success: true, reportId: report.id };
}

export async function approveP2HReport(reportId: number, signature: string) {
   const session = await auth();
   if (!session?.user?.id) throw new Error('Unauthorized');
   const role = session.user.role;
   
   const reportList = await db.select().from(p2hReports).where(eq(p2hReports.id, reportId)).limit(1);
   const report = reportList[0];
   if (!report) throw new Error('Report not found');
   
   if (role === 'leader') {
      if (report.status !== 'Submitted') {
        throw new Error('Laporan hanya dapat disetujui oleh Instruktur jika status Submitted');
      }
      await db.update(p2hReports).set({
         status: 'PendingSupervisor',
         leaderSig: signature,
         updatedAt: new Date(),
      }).where(eq(p2hReports.id, reportId));
      
      await pushNotification(report.operatorId, 'info', 'Laporan Menunggu Dosen', `Laporan Anda telah disetujui Instruktur. Menunggu persetujuan Dosen.`, `/review/${encryptId(reportId)}`);
      await logAuditEvent(parseInt(session.user.id), 'report.approve', 'p2h_reports', reportId, 'Approved by Leader');
   } else if (role === 'supervisor') {
      if (report.status !== 'PendingSupervisor') {
        throw new Error('Laporan memerlukan persetujuan Instruktur terlebih dahulu');
      }
      if (!report.leaderSig) {
        throw new Error('Tanda tangan Instruktur diperlukan sebelum persetujuan Dosen');
      }
      await db.update(p2hReports).set({
         status: 'Approved',
         supervisorSig: signature,
         updatedAt: new Date(),
      }).where(eq(p2hReports.id, reportId));
      
      await pushNotification(report.operatorId, 'success', 'Laporan Disetujui', `Laporan Anda telah disetujui oleh Dosen.`, `/reports/${encryptId(reportId)}`);
      await logAuditEvent(parseInt(session.user.id), 'report.approve', 'p2h_reports', reportId, 'Approved by Supervisor');
   } else {
     throw new Error('Role tidak memiliki akses untuk persetujuan');
   }
   
   revalidatePath('/dashboard');
   revalidatePath(`/review/${encryptId(reportId)}`);
   return { success: true };
}

export async function rejectP2HReport(reportId: number, reason: string) {
   const session = await auth();
   if (!session?.user?.id) throw new Error('Unauthorized');
   const role = session.user.role;
   
   if (role !== 'leader' && role !== 'supervisor') {
     throw new Error('Role tidak memiliki akses untuk penolakan');
   }
   
   const reportList = await db.select().from(p2hReports).where(eq(p2hReports.id, reportId)).limit(1);
   const report = reportList[0];
   if (!report) throw new Error('Report not found');
   
   if (report.status !== 'Submitted' && report.status !== 'PendingSupervisor') {
     throw new Error('Laporan hanya dapat ditolak jika status Submitted atau PendingSupervisor');
   }
   
    await db.update(p2hReports).set({
       status: 'Rejected',
       rejectionReason: reason,
       updatedAt: new Date(),
    }).where(eq(p2hReports.id, reportId));
    
    await pushNotification(report.operatorId, 'error', 'Laporan Ditolak', `Laporan Anda ditolak. Alasan: ${reason}`, `/reports/${encryptId(reportId)}`);
    await logAuditEvent(parseInt(session.user.id), 'report.reject', 'p2h_reports', reportId, `Rejected: ${reason}`);
   
   revalidatePath('/dashboard');
   revalidatePath(`/review/${encryptId(reportId)}`);
   return { success: true };
}
