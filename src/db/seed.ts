import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './index';
import { users } from './schema';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database...');
  
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await db.insert(users).values([
    {
      username: 'operator1',
      passwordHash,
      fullName: 'Budi (Operator)',
      role: 'operator',
    },
    {
      username: 'leader1',
      passwordHash,
      fullName: 'Agus (Leader)',
      role: 'leader',
    },
    {
      username: 'supervisor1',
      passwordHash,
      fullName: 'Siti (Supervisor)',
      role: 'supervisor',
    }
  ]).onConflictDoNothing();
  
  console.log('Database seeded successfully!');
}

main().catch(console.error);
