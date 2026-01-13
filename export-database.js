require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Database connection string from .env
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found in .env file');
  process.exit(1);
}

// Output file
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const outputFile = path.join(__dirname, `database-export-${timestamp}.sql`);

console.log('\n🔧 Starting Database Export...\n');
console.log('📊 Database:', DATABASE_URL.split('@')[1] || 'Connected');
console.log('📁 Output File:', outputFile);
console.log('\n⏳ Exporting data...\n');

// pg_dump command to export database
// This exports schema + data in SQL format
const command = `pg_dump "${DATABASE_URL}" > "${outputFile}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Export Error:', error.message);
    console.error('\n⚠️  Alternative method:');
    console.error('   1. Install pg_dump: https://www.postgresql.org/download/');
    console.error('   2. Or use manual export script below\n');
    process.exit(1);
  }

  if (stderr) {
    console.log('⚠️  Warnings:', stderr);
  }

  console.log('✅ Database exported successfully!');
  console.log(`📁 File: ${outputFile}`);
  console.log(`📊 Size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB\n`);
  
  console.log('🚀 Next Steps:');
  console.log('   1. Go to https://railway.app');
  console.log('   2. Create new PostgreSQL database');
  console.log('   3. Get the DATABASE_URL from Railway');
  console.log('   4. Import this file using:');
  console.log(`      psql "YOUR_RAILWAY_DATABASE_URL" < ${outputFile}`);
  console.log('\n✅ Done!\n');
});
