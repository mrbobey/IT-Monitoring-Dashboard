// Quick script to check database entries with images
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
  console.log('🔍 Checking database for image entries...\n');
  
  try {
    // Check materials table for items with images
    console.log('📦 MATERIALS (Inventory Parts) with Images:');
    console.log('=' .repeat(80));
    const materials = await pool.query(`
      SELECT id, name, part_type, quantity, image_path, created_at 
      FROM materials 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    if (materials.rows.length === 0) {
      console.log('⚠️  No materials found in database\n');
    } else {
      console.log(`Found ${materials.rows.length} material(s):\n`);
      materials.rows.forEach(item => {
        console.log(`  ID: ${item.id}`);
        console.log(`  Name: ${item.name}`);
        console.log(`  Type: ${item.part_type || 'N/A'}`);
        console.log(`  Quantity: ${item.quantity}`);
        console.log(`  Image: ${item.image_path ? '✅ ' + item.image_path : '❌ No image'}`);
        console.log(`  Created: ${item.created_at}`);
        console.log('  ' + '-'.repeat(76));
      });
    }
    
    // Count materials with and without images
    const materialStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(image_path) as with_images,
        COUNT(*) - COUNT(image_path) as without_images
      FROM materials
    `);
    console.log('\n📊 Materials Statistics:');
    console.log(`  Total items: ${materialStats.rows[0].total}`);
    console.log(`  With images: ${materialStats.rows[0].with_images}`);
    console.log(`  Without images: ${materialStats.rows[0].without_images}\n`);
    
    // Check branch_pcs table for PCs with images
    console.log('\n💻 BRANCH PCS with Images:');
    console.log('=' .repeat(80));
    const pcs = await pool.query(`
      SELECT id, branch_name, desktop_name, motherboard, motherboard_serial, pc_image_path 
      FROM branch_pcs 
      ORDER BY id DESC 
      LIMIT 10
    `);
    
    if (pcs.rows.length === 0) {
      console.log('⚠️  No PCs found in database\n');
    } else {
      console.log(`Found ${pcs.rows.length} PC(s):\n`);
      pcs.rows.forEach(pc => {
        console.log(`  ID: ${pc.id}`);
        console.log(`  Branch: ${pc.branch_name || 'N/A'}`);
        console.log(`  Desktop: ${pc.desktop_name || 'N/A'}`);
        console.log(`  Motherboard: ${pc.motherboard || 'N/A'}`);
        console.log(`  MB Serial: ${pc.motherboard_serial || 'N/A'}`);
        console.log(`  Image: ${pc.pc_image_path ? '✅ ' + pc.pc_image_path : '❌ No image'}`);
        console.log('  ' + '-'.repeat(76));
      });
    }
    
    // Count PCs with and without images
    const pcStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(pc_image_path) as with_images,
        COUNT(*) - COUNT(pc_image_path) as without_images
      FROM branch_pcs
    `);
    console.log('\n📊 Branch PCs Statistics:');
    console.log(`  Total PCs: ${pcStats.rows[0].total}`);
    console.log(`  With images: ${pcStats.rows[0].with_images}`);
    console.log(`  Without images: ${pcStats.rows[0].without_images}\n`);
    
    // Check migrations table
    console.log('\n🔄 Migration History:');
    console.log('=' .repeat(80));
    const migrations = await pool.query(`
      SELECT name, executed_at 
      FROM migrations 
      ORDER BY executed_at DESC
    `);
    
    if (migrations.rows.length === 0) {
      console.log('⚠️  No migrations recorded\n');
    } else {
      migrations.rows.forEach(m => {
        console.log(`  ✅ ${m.name} - executed at ${m.executed_at}`);
      });
    }
    
    console.log('\n✅ Database check complete!\n');
    
  } catch (err) {
    console.error('❌ Error checking database:', err.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
