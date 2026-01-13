require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function validateImageColumns() {
  try {
    console.log('🔍 Validating Database Schema...\n');
    
    // Check image columns
    const imageColumns = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('branch_pcs', 'materials') 
      AND column_name LIKE '%image%'
      ORDER BY table_name, ordinal_position
    `);
    
    console.log('📊 Image URL Columns:');
    console.table(imageColumns.rows);
    
    // Check sample data
    const pcSample = await pool.query(`
      SELECT id, branch_name, pc_image_path 
      FROM branch_pcs 
      WHERE pc_image_path IS NOT NULL 
      LIMIT 3
    `);
    
    const materialSample = await pool.query(`
      SELECT id, name, image_path 
      FROM materials 
      WHERE image_path IS NOT NULL 
      LIMIT 3
    `);
    
    console.log('\n📸 Sample PC Images:');
    if (pcSample.rows.length > 0) {
      pcSample.rows.forEach(row => {
        const isCloudinary = row.pc_image_path?.includes('cloudinary.com');
        console.log(`  ${isCloudinary ? '✅' : '❌'} ID ${row.id}: ${row.pc_image_path?.substring(0, 60)}...`);
      });
    } else {
      console.log('  No PC images found');
    }
    
    console.log('\n📦 Sample Inventory Images:');
    if (materialSample.rows.length > 0) {
      materialSample.rows.forEach(row => {
        const isCloudinary = row.image_path?.includes('cloudinary.com');
        console.log(`  ${isCloudinary ? '✅' : '❌'} ID ${row.id}: ${row.image_path?.substring(0, 60)}...`);
      });
    } else {
      console.log('  No inventory images found');
    }
    
    // Verify no local paths
    const localPathsPCs = await pool.query(`
      SELECT COUNT(*) as count 
      FROM branch_pcs 
      WHERE pc_image_path LIKE '/uploads/%' OR pc_image_path LIKE '%uploads/%'
    `);
    
    const localPathsMaterials = await pool.query(`
      SELECT COUNT(*) as count 
      FROM materials 
      WHERE image_path LIKE '/uploads/%' OR image_path LIKE '%uploads/%'
    `);
    
    const totalLocalPaths = parseInt(localPathsPCs.rows[0].count) + parseInt(localPathsMaterials.rows[0].count);
    
    console.log('\n🔐 Local Path Check:');
    if (totalLocalPaths > 0) {
      console.log(`  ⚠️  Found ${totalLocalPaths} entries with local paths (need migration)`);
    } else {
      console.log('  ✅ No local paths found - all using Cloudinary URLs');
    }
    
    console.log('\n✅ Validation Complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

validateImageColumns();
