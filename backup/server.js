const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const csvPath = path.join(__dirname, 'public', 'Copy of BRANCHES PC SPECS.csv');
function parseCSVLine(line) {
  const regex = /(?:"([^"]*)")|([^,]+)/g;
  const result = [];
  let match;
  while ((match = regex.exec(line))) {
    result.push(match[1] || match[2] || '');
  }
  return result.map(s => s.trim());
}
function importPCsIfNeeded(db) {
  db.get('SELECT COUNT(*) as count FROM branch_pcs', (err, row) => {
    if (err) return;
    if (row.count === 0 && fs.existsSync(csvPath)) {
      fs.readFile(csvPath, 'utf8', (err, data) => {
        if (err) return;
        const lines = data.split(/\r?\n/).filter(l => l.trim().length > 0);
        let headerIdx = lines.findIndex(l => l.includes('BRANCH NAME'));
        if (headerIdx === -1) return;
        for (let i = headerIdx + 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i]);
          if (row.length < 11 || !row[0]) continue;
          db.run(
            `INSERT INTO branch_pcs (branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10]]
          );
        }
        console.log('PC specs imported from CSV.');
      });
    }
  });
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    importPCsIfNeeded(db);
  }
});

// Create tables if not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskName TEXT,
    branchName TEXT,
    description TEXT,
    status TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT,
    taskId INTEGER,
    FOREIGN KEY (taskId) REFERENCES tasks(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS branch_pcs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_name TEXT,
    city TEXT,
    branch_code TEXT,
    desktop_name TEXT,
    pc_number TEXT,
    motherboard TEXT,
    processor TEXT,
    storage TEXT,
    ram TEXT,
    psu TEXT,
    monitor TEXT
  )`);
});

// ===== TASKS API =====
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/tasks', (req, res) => {
  const { taskName, branchName, description, status } = req.body;
  db.run(
    'INSERT INTO tasks (taskName, branchName, description, status) VALUES (?, ?, ?, ?)',
    [taskName, branchName, description, status],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  });
});

// ===== MATERIALS API =====
app.get('/materials', (req, res) => {
  db.all('SELECT * FROM materials', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/materials', (req, res) => {
  const { name, quantity, unit, taskId } = req.body;
  db.run(
    'INSERT INTO materials (name, quantity, unit, taskId) VALUES (?, ?, ?, ?)',
    [name, quantity, unit, taskId || null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});
app.delete('/materials/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM materials WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Material not found' });
    res.json({ message: 'Material deleted successfully' });
  });
});
app.put('/materials/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit, taskId } = req.body;
  db.run(
    'UPDATE materials SET name = ?, quantity = ?, unit = ?, taskId = ? WHERE id = ?',
    [name, quantity, unit, taskId || null, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Material not found' });
      res.json({ message: 'Material updated' });
    }
  );
});

// ===== BRANCH PCS API =====
app.get('/pcs', (req, res) => {
  db.all('SELECT * FROM branch_pcs', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/pcs', (req, res) => {
  const { branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor } = req.body;
  db.run(
    'INSERT INTO branch_pcs (branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});
app.delete('/pcs/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM branch_pcs WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'PC spec not found' });
    res.json({ message: 'PC spec deleted successfully' });
  });
});
app.put('/pcs/:id', (req, res) => {
  const { id } = req.params;
  const { branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor } = req.body;
  db.run(
    'UPDATE branch_pcs SET branch_name = ?, city = ?, branch_code = ?, desktop_name = ?, pc_number = ?, motherboard = ?, processor = ?, storage = ?, ram = ?, psu = ?, monitor = ? WHERE id = ?',
    [branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'PC spec not found' });
      res.json({ message: 'PC spec updated' });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
app.delete('/pcs/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM branch_pcs WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'PC spec not found' });
    res.json({ message: 'PC spec deleted successfully' });
  });
});

// PUT update PC spec by ID
app.put('/pcs/:id', (req, res) => {
  const { id } = req.params;
  const { branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor } = req.body;
  db.run(
    'UPDATE branch_pcs SET branch_name = ?, city = ?, branch_code = ?, desktop_name = ?, pc_number = ?, motherboard = ?, processor = ?, storage = ?, ram = ?, psu = ?, monitor = ? WHERE id = ?',
    [branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'PC spec not found' });
      res.json({ message: 'PC spec updated' });
    }
  );
});

// POST new material
app.post('/materials', (req, res) => {
  const { name, quantity, unit, taskId } = req.body;
  db.run(
    'INSERT INTO materials (name, quantity, unit, taskId) VALUES (?, ?, ?, ?)',
    [name, quantity, unit, taskId || null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// DELETE material by ID
app.delete('/materials/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM materials WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Material not found' });
    res.json({ message: 'Material deleted successfully' });
  });
});

// PUT update material by ID
app.put('/materials/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit, taskId } = req.body;
  db.run(
    'UPDATE materials SET name = ?, quantity = ?, unit = ?, taskId = ? WHERE id = ?',
    [name, quantity, unit, taskId || null, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Material not found' });
      res.json({ message: 'Material updated' });
    }
  );
});
app.get('/clear-db', (req, res) => {
  db.run('DELETE FROM tasks', [], function (err) {
    if (err) return res.status(500).json(err);
    res.json({ deleted: this.changes });
  });
});
