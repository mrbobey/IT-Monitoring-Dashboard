require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT * FROM materials')
  .then(res => {
    console.log('\n📦 Materials in Railway Database:\n');
    console.log('Total rows:', res.rows.length);
    console.log('\nData:');
    res.rows.forEach((row, i) => {
      console.log(`${i+1}. ID: ${row.id}, Part: ${row.part_type}, Status: ${row.status}`);
      console.log(`   Serial: ${row.serial_number}`);
      console.log(`   Image: ${row.image_path ? 'Yes' : 'No'}\n`);
    });
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
