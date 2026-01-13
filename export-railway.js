require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

console.log('\n📦 Exporting Railway database...\n');

const exportSQL = [];
const filename = `railway-local-backup-${new Date().toISOString().split('T')[0]}.sql`;

pool.query('SELECT * FROM tasks ORDER BY id')
  .then(res => {
    exportSQL.push('-- Railway Database Export');
    exportSQL.push(`-- Exported: ${new Date().toISOString()}`);
    exportSQL.push('-- Source: Railway PostgreSQL');
    exportSQL.push('');
    exportSQL.push('-- Tasks Table');
    exportSQL.push('');
    
    if (res.rows.length > 0) {
      res.rows.forEach(row => {
        const escape = str => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
        exportSQL.push(`INSERT INTO tasks (id, title, description, priority, status, due_date, assigned_to, created_at, updated_at) VALUES (${row.id}, ${escape(row.title)}, ${escape(row.description)}, ${escape(row.priority)}, ${escape(row.status)}, ${escape(row.due_date)}, ${escape(row.assigned_to)}, ${escape(row.created_at)}, ${escape(row.updated_at)});`);
      });
    }
    
    return pool.query('SELECT * FROM branch_pcs ORDER BY id');
  })
  .then(res => {
    exportSQL.push('');
    exportSQL.push('-- Branch PCs Table');
    exportSQL.push('');
    
    if (res.rows.length > 0) {
      res.rows.forEach(row => {
        const escape = str => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
        exportSQL.push(`INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (${row.id}, ${escape(row.branch)}, ${escape(row.device_name)}, ${escape(row.processor)}, ${escape(row.ram)}, ${escape(row.storage)}, ${escape(row.graphics_card)}, ${escape(row.os)}, ${escape(row.notes)}, ${escape(row.image_url)}, ${escape(row.created_at)});`);
      });
    }
    
    return pool.query('SELECT * FROM materials ORDER BY id');
  })
  .then(res => {
    exportSQL.push('');
    exportSQL.push('-- Materials Table');
    exportSQL.push('');
    
    if (res.rows.length > 0) {
      res.rows.forEach(row => {
        const escape = str => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
        exportSQL.push(`INSERT INTO materials (id, name, category, quantity, location, notes, image_url, created_at) VALUES (${row.id}, ${escape(row.name)}, ${escape(row.category)}, ${row.quantity || 0}, ${escape(row.location)}, ${escape(row.notes)}, ${escape(row.image_url)}, ${escape(row.created_at)});`);
      });
    } else {
      exportSQL.push('-- No materials data');
    }
    
    fs.writeFileSync(filename, exportSQL.join('\n'));
    
    console.log('✅ Export complete!');
    console.log('📄 File:', filename);
    console.log('📊 Size:', (fs.statSync(filename).size / 1024).toFixed(2), 'KB');
    console.log('📦 Tables exported: tasks, branch_pcs, materials\n');
    
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Export Error:', err.message, '\n');
    process.exit(1);
  });
