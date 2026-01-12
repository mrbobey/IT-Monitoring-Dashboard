/**
 * Database Schema Verification Script
 * Checks if all required columns exist for image upload features
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function verifyDatabaseSchema() {
  console.log('🔍 Starting database schema verification...\n');
  
  try {
    // Test connection
    const timeCheck = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log(`   Server time: ${timeCheck.rows[0].now}\n`);
    
    let allPassed = true;
    
    // ===== CHECK MATERIALS TABLE =====
    console.log('📋 Checking MATERIALS table...');
    
    const materialsExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'materials'
      )
    `);
    
    if (!materialsExists.rows[0].exists) {
      console.error('❌ CRITICAL: materials table does not exist!');
      allPassed = false;
    } else {
      console.log('✅ materials table exists');
      
      // Check columns
      const materialsColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'materials'
        ORDER BY ordinal_position
      `);
      
      const requiredColumns = [
        'id', 'name', 'quantity', 'part_type', 'status', 
        'serial_number', 'warranty_date', 'condition', 'image_path'
      ];
      
      const existingColumns = materialsColumns.rows.map(r => r.column_name);
      
      console.log('   Found columns:', existingColumns.join(', '));
      
      for (const col of requiredColumns) {
        if (existingColumns.includes(col)) {
          console.log(`   ✅ ${col}`);
        } else {
          console.error(`   ❌ MISSING: ${col}`);
          allPassed = false;
        }
      }
      
      // Special check for image_path
      if (existingColumns.includes('image_path')) {
        const imgCol = materialsColumns.rows.find(r => r.column_name === 'image_path');
        console.log(`   📸 image_path: ${imgCol.data_type}, nullable: ${imgCol.is_nullable}`);
      }
    }
    
    console.log();
    
    // ===== CHECK BRANCH_PCS TABLE =====
    console.log('📋 Checking BRANCH_PCS table...');
    
    const pcsExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'branch_pcs'
      )
    `);
    
    if (!pcsExists.rows[0].exists) {
      console.error('❌ CRITICAL: branch_pcs table does not exist!');
      allPassed = false;
    } else {
      console.log('✅ branch_pcs table exists');
      
      // Check columns
      const pcsColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'branch_pcs'
        ORDER BY ordinal_position
      `);
      
      const requiredPcColumns = [
        'id', 'branch_name', 'city', 'branch_code', 'desktop_name',
        'pc_number', 'motherboard', 'motherboard_serial', 'processor',
        'storage', 'ram', 'psu', 'monitor', 'pc_image_path'
      ];
      
      const existingPcColumns = pcsColumns.rows.map(r => r.column_name);
      
      console.log('   Found columns:', existingPcColumns.join(', '));
      
      for (const col of requiredPcColumns) {
        if (existingPcColumns.includes(col)) {
          console.log(`   ✅ ${col}`);
        } else {
          console.error(`   ❌ MISSING: ${col}`);
          allPassed = false;
        }
      }
      
      // Special checks for new columns
      if (existingPcColumns.includes('motherboard_serial')) {
        const mbCol = pcsColumns.rows.find(r => r.column_name === 'motherboard_serial');
        console.log(`   🔢 motherboard_serial: ${mbCol.data_type}, nullable: ${mbCol.is_nullable}`);
      }
      
      if (existingPcColumns.includes('pc_image_path')) {
        const imgCol = pcsColumns.rows.find(r => r.column_name === 'pc_image_path');
        console.log(`   📸 pc_image_path: ${imgCol.data_type}, nullable: ${imgCol.is_nullable}`);
      }
    }
    
    console.log();
    
    // ===== SUMMARY =====
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (allPassed) {
      console.log('🎉 VERIFICATION PASSED!');
      console.log('   All required columns exist and are properly configured.');
      console.log('   Image upload features should work correctly.');
    } else {
      console.log('❌ VERIFICATION FAILED!');
      console.log('   Some required columns are missing.');
      console.log('   Please run migrations or fix schema manually.');
      console.log('   Run: npm run migrate');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return allPassed;
    
  } catch (err) {
    console.error('❌ Verification error:', err);
    return false;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  verifyDatabaseSchema()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { verifyDatabaseSchema };
