require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// SQLite database file
const dbPath = path.join(__dirname, 'tasks.db');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const outputFile = path.join(__dirname, `railway-import-${timestamp}.sql`);

console.log('\n🔧 Exporting SQLite Database for Railway...\n');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database\n');
});

let sqlContent = `-- Database export for Railway (PostgreSQL compatible)
-- Generated: ${new Date().toISOString()}
-- Source: SQLite (tasks.db)
-- Target: PostgreSQL on Railway

`;

async function exportTable(tableName) {
  return new Promise((resolve, reject) => {
    // Get table schema
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`📦 Exporting table: ${tableName}`);
      console.log(`   Columns: ${columns.map(c => c.name).join(', ')}`);
      
      // Create table statement (PostgreSQL syntax)
      sqlContent += `\n-- Table: ${tableName}\n`;
      sqlContent += `DROP TABLE IF EXISTS ${tableName} CASCADE;\n`;
      sqlContent += `CREATE TABLE ${tableName} (\n`;
      
      const columnDefs = columns.map(col => {
        let type = col.type.toUpperCase();
        
        // Convert SQLite types to PostgreSQL
        if (type === 'INTEGER' && col.pk === 1) {
          type = 'SERIAL PRIMARY KEY';
        } else if (type === 'INTEGER') {
          type = 'INTEGER';
        } else if (type === 'TEXT') {
          type = 'TEXT';
        } else if (type === 'REAL') {
          type = 'REAL';
        } else if (type === 'BLOB') {
          type = 'BYTEA';
        }
        
        let def = `  ${col.name} ${type}`;
        
        if (col.notnull === 1 && col.pk === 0) {
          def += ' NOT NULL';
        }
        
        if (col.dflt_value !== null) {
          def += ` DEFAULT ${col.dflt_value}`;
        }
        
        return def;
      });
      
      sqlContent += columnDefs.join(',\n');
      sqlContent += '\n);\n\n';
      
      // Get data
      db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        console.log(`   ✅ ${rows.length} rows exported\n`);
        
        if (rows.length > 0) {
          const columnNames = columns.map(c => c.name);
          
          rows.forEach(row => {
            const values = columnNames.map(col => {
              const val = row[col];
              if (val === null || val === undefined) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'number') return val;
              return `'${val}'`;
            }).join(', ');
            
            sqlContent += `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${values});\n`;
          });
          sqlContent += '\n';
        }
        
        resolve();
      });
    });
  });
}

// Get all tables
db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`, async (err, tables) => {
  if (err) {
    console.error('❌ Error:', err.message);
    db.close();
    process.exit(1);
  }
  
  console.log(`📊 Found ${tables.length} tables: ${tables.map(t => t.name).join(', ')}\n`);
  
  try {
    // Export each table
    for (const table of tables) {
      await exportTable(table.name);
    }
    
    // Write to file
    fs.writeFileSync(outputFile, sqlContent);
    
    const fileSize = (fs.statSync(outputFile).size / 1024).toFixed(2);
    
    console.log('✅ Export complete!');
    console.log(`📁 File: ${outputFile}`);
    console.log(`📊 Size: ${fileSize} KB\n`);
    
    console.log('🚀 Next Steps for Railway Migration:\n');
    console.log('1️⃣  Go to https://railway.app');
    console.log('2️⃣  Create new project');
    console.log('3️⃣  Add PostgreSQL database');
    console.log('4️⃣  Click on PostgreSQL → Variables → Copy DATABASE_URL');
    console.log('5️⃣  Import data using one of these methods:\n');
    console.log('   Method A - Railway CLI:');
    console.log('   $ npm install -g @railway/cli');
    console.log('   $ railway login');
    console.log('   $ railway link');
    console.log(`   $ railway run psql < ${path.basename(outputFile)}\n`);
    console.log('   Method B - Direct psql:');
    console.log(`   $ psql "YOUR_RAILWAY_DATABASE_URL" < ${path.basename(outputFile)}\n`);
    console.log('   Method C - Copy content manually:');
    console.log('   - Open the SQL file in a text editor');
    console.log('   - Copy all content');
    console.log('   - Paste in Railway SQL console\n');
    
    console.log('6️⃣  Update your .env file:');
    console.log('   DATABASE_URL=your_railway_database_url\n');
    console.log('7️⃣  Update render.yaml to use Railway DATABASE_URL\n');
    
    db.close();
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
  }
});
