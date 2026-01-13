require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const railwayPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const renderPool = new Pool({
  connectionString: 'postgresql://bob:kRDmeVZoxBsAGQ8WjPcQ9WO6wCi4aC3s@dpg-d5es76n5r7bs73c1v9k0-a.oregon-postgres.render.com/itmonitoring',
  ssl: { rejectUnauthorized: false }
});

console.log('\n📦 Migrating materials from Render to Railway...\n');

// First, add missing columns to Railway
const alterSQL = `
ALTER TABLE materials ADD COLUMN IF NOT EXISTS part_type TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS warranty_date TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS condition TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS image_path TEXT;
`;

railwayPool.query(alterSQL)
  .then(() => {
    console.log('✅ Updated Railway schema with missing columns\n');
    return renderPool.query('SELECT * FROM materials ORDER BY id');
  })
  .then(res => {
    console.log('📊 Found', res.rows.length, 'materials in Render\n');
    
    const insertPromises = res.rows.map((row, i) => {
      console.log(`${i+1}. Importing: ${row.part_type} - ${row.status}`);
      
      return railwayPool.query(
        `INSERT INTO materials (id, name, quantity, unit, taskid, part_type, status, serial_number, warranty_date, condition, created_at, updated_at, image_path) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [row.id, row.name, row.quantity, row.unit, row.taskid, row.part_type, row.status, row.serial_number, row.warranty_date, row.condition, row.created_at, row.updated_at, row.image_path]
      );
    });
    
    return Promise.all(insertPromises);
  })
  .then(() => {
    return railwayPool.query('SELECT COUNT(*) as count FROM materials');
  })
  .then(res => {
    console.log('\n✅ Migration complete!');
    console.log('📊 Materials in Railway:', res.rows[0].count, '\n');
    
    railwayPool.end();
    renderPool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Migration Error:', err.message, '\n');
    railwayPool.end();
    renderPool.end();
    process.exit(1);
  });
