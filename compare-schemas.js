require('dotenv').config();
const { Pool } = require('pg');

// Railway
const railwayPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Render
const renderPool = new Pool({
  connectionString: 'postgresql://bob:kRDmeVZoxBsAGQ8WjPcQ9WO6wCi4aC3s@dpg-d5es76n5r7bs73c1v9k0-a.oregon-postgres.render.com/itmonitoring',
  ssl: { rejectUnauthorized: false }
});

console.log('\n🔍 Comparing database schemas...\n');

Promise.all([
  railwayPool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'materials' ORDER BY ordinal_position"),
  renderPool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'materials' ORDER BY ordinal_position")
])
  .then(([railwayRes, renderRes]) => {
    console.log('📊 Railway materials columns:');
    railwayRes.rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`));
    
    console.log('\n📊 Render materials columns:');
    renderRes.rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`));
    
    console.log('\n');
    railwayPool.end();
    renderPool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Error:', err.message, '\n');
    railwayPool.end();
    renderPool.end();
    process.exit(1);
  });
