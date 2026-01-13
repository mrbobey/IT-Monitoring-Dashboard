require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Output file
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const outputFile = path.join(__dirname, `database-backup-${timestamp}.sql`);

async function exportDatabase() {
  try {
    console.log('\n🔧 Starting Manual Database Export...\n');
    
    let sqlContent = '';
    
    // Get all table names
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`📊 Found ${tables.length} tables: ${tables.join(', ')}\n`);
    
    // Export each table
    for (const table of tables) {
      console.log(`📦 Exporting ${table}...`);
      
      // Get table schema
      const schemaResult = await pool.query(`
        SELECT column_name, data_type, column_default, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      // Create table statement
      sqlContent += `\n-- Table: ${table}\n`;
      sqlContent += `DROP TABLE IF EXISTS ${table} CASCADE;\n`;
      sqlContent += `CREATE TABLE ${table} (\n`;
      
      const columns = schemaResult.rows.map(col => {
        let def = `  ${col.column_name} ${col.data_type}`;
        if (col.column_default) {
          if (col.column_default.includes('nextval')) {
            def = `  ${col.column_name} SERIAL`;
          } else {
            def += ` DEFAULT ${col.column_default}`;
          }
        }
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        return def;
      });
      
      sqlContent += columns.join(',\n');
      sqlContent += '\n);\n\n';
      
      // Get primary key
      const pkResult = await pool.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary
      `, [table]);
      
      if (pkResult.rows.length > 0) {
        const pkColumns = pkResult.rows.map(r => r.attname).join(', ');
        sqlContent += `ALTER TABLE ${table} ADD PRIMARY KEY (${pkColumns});\n\n`;
      }
      
      // Get data
      const dataResult = await pool.query(`SELECT * FROM ${table}`);
      console.log(`   ✅ ${dataResult.rows.length} rows`);
      
      if (dataResult.rows.length > 0) {
        const columnNames = Object.keys(dataResult.rows[0]);
        
        for (const row of dataResult.rows) {
          const values = columnNames.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            return val;
          }).join(', ');
          
          sqlContent += `INSERT INTO ${table} (${columnNames.join(', ')}) VALUES (${values});\n`;
        }
        sqlContent += '\n';
      }
    }
    
    // Get sequences and reset them
    const seqResult = await pool.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);
    
    if (seqResult.rows.length > 0) {
      sqlContent += '\n-- Reset sequences\n';
      for (const seq of seqResult.rows) {
        const maxResult = await pool.query(`
          SELECT setval('${seq.sequence_name}', 
            (SELECT COALESCE(MAX(id), 1) FROM ${seq.sequence_name.replace('_id_seq', '')}), 
            true)
        `);
      }
    }
    
    // Write to file
    fs.writeFileSync(outputFile, sqlContent);
    
    const fileSize = (fs.statSync(outputFile).size / 1024).toFixed(2);
    
    console.log('\n✅ Database exported successfully!');
    console.log(`📁 File: ${outputFile}`);
    console.log(`📊 Size: ${fileSize} KB\n`);
    
    console.log('🚀 To import to Railway:');
    console.log('   1. Go to https://railway.app');
    console.log('   2. Create new project → Add PostgreSQL');
    console.log('   3. Click on PostgreSQL → Connect → Copy DATABASE_URL');
    console.log('   4. Run this command:');
    console.log(`      psql "YOUR_RAILWAY_DATABASE_URL" < ${outputFile}`);
    console.log('   5. Or use Railway CLI:');
    console.log('      railway up');
    console.log(`      railway run psql < ${outputFile}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

exportDatabase();
