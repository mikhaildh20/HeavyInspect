import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:123@localhost:5432/heavy_inspect';
process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'secret123';

async function main() {
  const { db } = await import('./index');
  const { users, units, checklistCategories, checklistParameters, unitChecklistItems } = await import('./schema');
  const bcrypt = (await import('bcryptjs')).default;

  console.log('Seeding database...');
  
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  // 1. Users
  await db.insert(users).values([
    { username: 'operator1', passwordHash, fullName: 'Budi (Operator)', role: 'operator' },
    { username: 'leader1', passwordHash, fullName: 'Agus (Leader)', role: 'leader' },
    { username: 'supervisor1', passwordHash, fullName: 'Siti (Supervisor)', role: 'supervisor' },
    { username: 'admin1', passwordHash: adminHash, fullName: 'Admin (Super)', role: 'admin' },
  ]).onConflictDoNothing();
  console.log('✓ Users seeded');

  // 2. Units
  await db.insert(units).values([
    { unitCode: '0101', modelName: 'Komatsu PC 200-8', lastSmr: 3001, serialNumber: 'MKPC200-8A0101', woJono: 'WO-2026-001', zone: 'Pit Barat', inspectionStart: '06:00' },
    { unitCode: '0205', modelName: 'Komatsu PC 400-8', lastSmr: 5420, serialNumber: 'MKPC400-8A0205', woJono: 'WO-2026-002', zone: 'Pit Timur', inspectionStart: '06:00' },
    { unitCode: '0312', modelName: 'CAT 320GC', lastSmr: 2180, serialNumber: 'CAT320GC0312', woJono: 'WO-2026-003', zone: 'Pit Utara', inspectionStart: '07:00' },
    { unitCode: '0408', modelName: 'Komatsu HD785-5', lastSmr: 8750, serialNumber: 'MKHD785-5A0408', woJono: 'WO-2026-004', zone: 'Haul Road 1', inspectionStart: '06:00' },
    { unitCode: '0503', modelName: 'Komatsu WA380-8', lastSmr: 4320, serialNumber: 'MKWA380-8A0503', woJono: 'WO-2026-005', zone: 'Stockpile', inspectionStart: '06:30' },
    { unitCode: '0615', modelName: 'CAT D6T', lastSmr: 6100, serialNumber: 'CATD6T0615', woJono: 'WO-2026-006', zone: 'Pit Selatan', inspectionStart: '07:00' },
    { unitCode: '0721', modelName: 'Komatsu PC 200-8', lastSmr: 1890, serialNumber: 'MKPC200-8A0721', woJono: 'WO-2026-007', zone: 'Pit Barat', inspectionStart: '06:00' },
    { unitCode: '0810', modelName: 'Komatsu GD655-7', lastSmr: 3450, serialNumber: 'MKGD655-7A0810', woJono: 'WO-2026-008', zone: 'Haul Road 2', inspectionStart: '06:30' },
  ]).onConflictDoNothing();
  console.log('✓ Units seeded');

  // 3. Checklist Categories
  await db.insert(checklistCategories).values([
    { letter: 'A', name: 'Bucket Area', sortOrder: 0 },
    { letter: 'B', name: 'Cylinder Attachment Area', sortOrder: 1 },
    { letter: 'C', name: 'Working Attachment Area', sortOrder: 2 },
  ]).onConflictDoNothing();
  console.log('✓ Checklist categories seeded');

  // 4. Checklist Parameters
  await db.insert(checklistParameters).values([
    { categoryId: 1, category: 'A. Bucket Area', description: 'Bucket', sortOrder: 0 },
    { categoryId: 1, category: 'A. Bucket Area', description: 'Link Bucket', sortOrder: 1 },
    { categoryId: 1, category: 'A. Bucket Area', description: 'Teeth Bucket', sortOrder: 2 },
    { categoryId: 1, category: 'A. Bucket Area', description: 'Pin Bucket', sortOrder: 3 },
    { categoryId: 1, category: 'A. Bucket Area', description: 'Hose Grease Pin', sortOrder: 4 },
    { categoryId: 2, category: 'B. Cylinder Attachment Area', description: 'Boom Cylinder RH', sortOrder: 0 },
    { categoryId: 2, category: 'B. Cylinder Attachment Area', description: 'Boom Cylinder LH', sortOrder: 1 },
    { categoryId: 2, category: 'B. Cylinder Attachment Area', description: 'Bucket Cylinder', sortOrder: 2 },
    { categoryId: 2, category: 'B. Cylinder Attachment Area', description: 'Arm Cylinder', sortOrder: 3 },
    { categoryId: 3, category: 'C. Working Attachment Area', description: 'Boom Attachment', sortOrder: 0 },
    { categoryId: 3, category: 'C. Working Attachment Area', description: 'Arm Attachment', sortOrder: 1 },
    { categoryId: 3, category: 'C. Working Attachment Area', description: 'LH lock pin boom pivot', sortOrder: 2 },
    { categoryId: 3, category: 'C. Working Attachment Area', description: 'RH lock pin boom pivot', sortOrder: 3 },
  ]).onConflictDoNothing();
  console.log('✓ Checklist parameters seeded');

  // 5. Unit-Checklist Items (all units get all parameters)
  const allParams = await db.select().from(checklistParameters);
  const uciValues: { unitId: number; parameterId: number; sortOrder: number }[] = [];

  for (let unitId = 1; unitId <= 8; unitId++) {
    allParams.forEach((p) => {
      uciValues.push({ unitId, parameterId: p.id, sortOrder: p.sortOrder });
    });
  }

  await db.insert(unitChecklistItems).values(uciValues).onConflictDoNothing();
  console.log('✓ Unit checklist items seeded');

  console.log('Database seeded successfully!');
}

main().catch(console.error);
