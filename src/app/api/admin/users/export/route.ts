import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { and, isNull, eq } from 'drizzle-orm';
import * as XLSX from 'xlsx';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const unChangedUsers = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      role: users.role,
      generatedPassword: users.generatedPassword,
    })
    .from(users)
    .where(
      and(
        eq(users.mustChangePassword, true),
        isNull(users.deletedAt),
      )
    );

  if (unChangedUsers.length === 0) {
    return NextResponse.json({ error: 'Tidak ada user yang belum mengubah password' }, { status: 404 });
  }

  const roleLabels: Record<string, string> = {
    operator: 'Mahasiswa',
    leader: 'Instruktur',
    supervisor: 'Dosen',
    admin: 'Admin',
  };

  const rows = unChangedUsers.map((u) => ({
    'Nama Lengkap': u.fullName,
    Username: u.username,
    Role: roleLabels[u.role] || u.role,
    Password: u.generatedPassword || '(tidak tersedia)',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 15 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Users');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="users_password.xlsx"`,
    },
  });
}
