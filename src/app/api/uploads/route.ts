import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format file tidak didukung' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}_${randomBytes(8).toString('hex')}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    const url = `/uploads/${folder}/${filename}`;

    return NextResponse.json({ url, filename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Gagal upload file' }, { status: 500 });
  }
}
