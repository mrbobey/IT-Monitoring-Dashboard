require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const filename = `railway-complete-backup-${new Date().toISOString().split('T')[0]}.sql`;
const exportSQL = [];

const escape = val => {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val;
  if (val instanceof Date) return `'${val.toISOString()}'`;
  return `'${val.toString().replace(/'/g, "''")}'`;
};

console.log('\n📦 Exporting complete Railway database...\n');

exportSQL.push('-- Railway Database Complete Backup');
exportSQL.push(`-- Exported: ${new Date().toISOString()}`);
exportSQL.push('-- Database: Railway PostgreSQL');
exportSQL.push('');

pool.query('SELECT * FROM tasks ORDER BY id')
  .then(res => {
    exportSQL.push('-- ===================');
    exportSQL.push('-- TASKS TABLE');
    exportSQL.push('-- ===================');
    exportSQL.push('');
    
    console.log('✅ Tasks:', res.rows.length);
    
    res.rows.forEach(row => {
      exportSQL.push(`INSERT INTO tasks (id, title, description, priority, status, due_date, assigned_to, created_at, updated_at) VALUES (${row.id}, ${escape(row.title)}, ${escape(row.description)}, ${escape(row.priority)}, ${escape(row.status)}, ${escape(row.due_date)}, ${escape(row.assigned_to)}, ${escape(row.created_at)}, ${escape(row.updated_at)});`);
    });
    
    exportSQL.push('');
    return pool.query('SELECT * FROM branch_pcs ORDER BY id');
  })
  .then(res => {
    exportSQL.push('-- ===================');
    exportSQL.push('-- BRANCH PCS TABLE');
    exportSQL.push('-- ===================');
    exportSQL.push('');
    
    console.log('✅ Branch PCs:', res.rows.length);
    
    res.rows.forEach(row => {
      exportSQL.push(`INSERT INTO branch_pcs (id, branch, device_name, processor, ram, storage, graphics_card, os, notes, image_url, created_at) VALUES (${row.id}, ${escape(row.branch)}, ${escape(row.device_name)}, ${escape(row.processor)}, ${escape(row.ram)}, ${escape(row.storage)}, ${escape(row.graphics_card)}, ${escape(row.os)}, ${escape(row.notes)}, ${escape(row.image_url)}, ${escape(row.created_at)});`);
    });
    
    exportSQL.push('');
    return pool.query('SELECT * FROM materials ORDER BY id');
  })
  .then(res => {
    exportSQL.push('-- ===================');
    exportSQL.push('-- MATERIALS TABLE');
    exportSQL.push('-- ===================');
    exportSQL.push('');
    
    console.log('✅ Materials:', res.rows.length);
    
    res.rows.forEach(row => {
      exportSQL.push(`INSERT INTO materials (id, name, quantity, unit, taskid, part_type, status, serial_number, warranty_date, condition, created_at, updated_at, image_path) VALUES (${row.id}, ${escape(row.name)}, ${escape(row.quantity)}, ${escape(row.unit)}, ${escape(row.taskid)}, ${escape(row.part_type)}, ${escape(row.status)}, ${escape(row.serial_number)}, ${escape(row.warranty_date)}, ${escape(row.condition)}, ${escape(row.created_at)}, ${escape(row.updated_at)}, ${escape(row.image_path)});`);
    });
    
    fs.writeFileSync(filename, exportSQL.join('\n'));
    
    const stats = fs.statSync(filename);
    
    console.log('\n✅ Export complete!');
    console.log('📄 File:', filename);
    console.log('📊 Size:', (stats.size / 1024).toFixed(2), 'KB');
    console.log('📦 Total records:', res.rows.length + 18, '(7 tasks + 11 PCs + 7 materials)\n');
    
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Export Error:', err.message, '\n');
    pool.end();
    process.exit(1);
  });
