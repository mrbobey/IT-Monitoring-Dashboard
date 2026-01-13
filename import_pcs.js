const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const csvPath = path.join(__dirname, 'public', 'Copy of BRANCHES PC SPECS.csv');
const db = new sqlite3.Database('./tasks.db');

function parseCSVLine(line) {
  // Split by comma, but handle quoted commas
  const regex = /(?:"([^"]*)")|([^,]+)/g;
  const result = [];
  let match;
  while ((match = regex.exec(line))) {
    result.push(match[1] || match[2] || '');
  }
  return result.map(s => s.trim());
}

fs.readFile(csvPath, 'utf8', (err, data) => {
  if (err) throw err;
  const lines = data.split(/\r?\n/).filter(l => l.trim().length > 0);
  // Find the header row
  let headerIdx = lines.findIndex(l => l.includes('BRANCH NAME'));
  if (headerIdx === -1) throw new Error('Header row not found');
  const headers = parseCSVLine(lines[headerIdx]);
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 11 || !row[0]) continue; // skip empty/invalid rows
    db.run(
      `INSERT INTO branch_pcs (branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10]],
      function(err) {
        if (err) console.error('Insert error:', err.message);
      }
    );
  }
  console.log('Import complete.');
  db.close();
});
