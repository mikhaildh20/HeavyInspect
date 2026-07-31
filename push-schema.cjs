const Database = require('better-sqlite3');
const db = new Database('local.db');

const stmts = [
  "ALTER TABLE units ADD COLUMN serial_number TEXT DEFAULT ''",
  "ALTER TABLE units ADD COLUMN wo_jo_no TEXT DEFAULT ''",
  "ALTER TABLE units ADD COLUMN zone TEXT DEFAULT ''",
  "ALTER TABLE units ADD COLUMN inspection_start TEXT DEFAULT ''",
  "ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 0",
  "ALTER TABLE users ADD COLUMN generated_password TEXT",
  "ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT ''",
];

for (const s of stmts) {
  try {
    db.exec(s);
    console.log('OK:', s.substring(0, 60));
  } catch (e) {
    console.log('SKIP:', s.substring(0, 60), '-', e.message);
  }
}

// Fix notifications table: rename "read" column to "is_read" if it exists
try {
  const cols = db.prepare("PRAGMA table_info(notifications)").all();
  const hasRead = cols.some(c => c.name === 'read');
  const hasIsRead = cols.some(c => c.name === 'is_read');
  if (hasRead && !hasIsRead) {
    db.exec('ALTER TABLE notifications RENAME COLUMN "read" TO is_read');
    console.log('OK: Renamed notifications."read" to is_read');
  } else if (hasIsRead) {
    console.log('SKIP: notifications already has is_read column');
  }
} catch (e) {
  console.log('SKIP notifications rename:', e.message);
}

// Create notifications table if it doesn't exist (with correct schema)
try {
  db.exec(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    type TEXT DEFAULT 'info' NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0 NOT NULL,
    action_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  console.log('OK: notifications table created/verified');
} catch (e) {
  console.log('SKIP notifications:', e.message);
}

db.close();
console.log('Done.');
