const Database = require('better-sqlite3');
const db = new Database('local.db');

const stmts = [
  "ALTER TABLE units ADD COLUMN serial_number TEXT DEFAULT ''",
  "ALTER TABLE units ADD COLUMN wo_jo_no TEXT DEFAULT ''",
  "ALTER TABLE units ADD COLUMN zone TEXT DEFAULT ''",
  "ALTER TABLE units ADD COLUMN inspection_start TEXT DEFAULT ''",
  "ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 0",
  "ALTER TABLE users ADD COLUMN generated_password TEXT",
];

for (const s of stmts) {
  try {
    db.exec(s);
    console.log('OK:', s.substring(0, 60));
  } catch (e) {
    console.log('SKIP:', s.substring(0, 60), '-', e.message);
  }
}

try {
  db.exec(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    type TEXT DEFAULT 'info' NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    "read" INTEGER DEFAULT 0 NOT NULL,
    action_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  console.log('OK: notifications table created');
} catch (e) {
  console.log('SKIP notifications:', e.message);
}

db.close();
console.log('Done.');
