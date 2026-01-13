require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

console.log('\n🔍 Checking Railway Database...\n');

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")
  .then(res => {
    console.log('📋 Tables found:');
    res.rows.forEach(r => console.log('  -', r.table_name));
    console.log('');
    
    return pool.query('SELECT COUNT(*) as tasks FROM tasks');
  })
  .then(res => {
    console.log('📊 Row counts:');
    console.log('  Tasks:', res.rows[0].tasks);
    return pool.query('SELECT COUNT(*) as pcs FROM branch_pcs');
  })
  .then(res => {
    console.log('  Branch PCs:', res.rows[0].pcs);
    return pool.query('SELECT COUNT(*) as materials FROM materials');
  })
  .then(res => {
    console.log('  Materials:', res.rows[0].materials);
    console.log('');
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Error:', err.message, '\n');
    pool.end();
    process.exit(1);
  });
