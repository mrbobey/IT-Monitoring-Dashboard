/**
 * Database Migration Runner
 * Executes SQL migration files in order
 * Safe to run multiple times
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  console.log('🔄 Starting database migrations...');
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Create migrations tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Migrations tracking table ready');
    
    // Read migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  No migrations directory found, skipping...');
      return;
    }
    
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`📁 Found ${files.length} migration file(s)`);
    
    for (const file of files) {
      // Check if already executed
      const result = await pool.query(
        'SELECT id FROM migrations WHERE name = $1',
        [file]
      );
      
      if (result.rows.length > 0) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }
      
      // Execute migration
      console.log(`🔧 Executing migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        );
        await pool.query('COMMIT');
        console.log(`✅ Migration ${file} completed successfully`);
      } catch (err) {
        await pool.query('ROLLBACK');
        console.error(`❌ Migration ${file} failed:`, err.message);
        throw err;
      }
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (err) {
    console.error('❌ Migration error:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ Migration process finished');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Migration process failed:', err);
      process.exit(1);
    });
}

module.exports = { runMigrations };
