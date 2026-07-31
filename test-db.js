const postgres = require('postgres');
const url = 'postgresql://postgres:%40Gita141203%40@db.wfbxaiwygjkayindvnhr.supabase.co:5432/postgres';
const sql = postgres(url, { connect_timeout: 10, ssl: 'require' });
sql.unsafe`SELECT 1 as test`.then(r => {
  console.log('Connection OK:', JSON.stringify(r));
  process.exit(0);
}).catch(e => {
  console.error('Connection FAILED:', e.message);
  process.exit(1);
});
