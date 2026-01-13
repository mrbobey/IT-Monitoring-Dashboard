const { Pool } = require('pg');
const fs = require('fs');

const renderPool = new Pool({
  connectionString: 'postgresql://bob:kRDmeVZoxBsAGQ8WjPcQ9WO6wCi4aC3s@dpg-d5es76n5r7bs73c1v9k0-a.oregon-postgres.render.com/itmonitoring',
  ssl: { rejectUnauthorized: false }
});

console.log('\n📦 Exporting materials from Render database...\n');

renderPool.query('SELECT * FROM materials ORDER BY id')
  .then(res => {
    console.log('✅ Found', res.rows.length, 'materials\n');
    
    const exportSQL = [];
    exportSQL.push('-- Materials from Render Database');
    exportSQL.push(`-- Exported: ${new Date().toISOString()}`);
    exportSQL.push('-- Total rows: ' + res.rows.length);
    exportSQL.push('');
    
    if (res.rows.length > 0) {
      res.rows.forEach((row, i) => {
        const escape = str => str ? `'${str.replace(/'/g, "''")}'` : 'NULL';
        
        console.log(`${i+1}. ID: ${row.id}, Part: ${row.part_type}, Status: ${row.status}`);
        
        // Check which columns exist in the row
        const columns = Object.keys(row);
        const values = columns.map(col => {
          if (row[col] === null) return 'NULL';
          if (typeof row[col] === 'number') return row[col];
          if (typeof row[col] === 'boolean') return row[col];
          return escape(row[col].toString());
        });
        
        exportSQL.push(`INSERT INTO materials (${columns.join(', ')}) VALUES (${values.join(', ')});`);
      });
    }
    
    const filename = 'render-materials-export.sql';
    fs.writeFileSync(filename, exportSQL.join('\n'));
    
    console.log('\n✅ Export complete!');
    console.log('📄 File:', filename);
    console.log('📊 Size:', (fs.statSync(filename).size / 1024).toFixed(2), 'KB\n');
    
    renderPool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Export Error:', err.message, '\n');
    renderPool.end();
    process.exit(1);
  });
