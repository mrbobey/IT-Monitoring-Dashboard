const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== PostgreSQL Connection =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Render
});

pool.connect()
  .then(() => console.log("✅ Connected to DB:", process.env.DATABASE_URL))
  .catch(err => console.error("❌ DB connection error:", err));

// ===== CSV Import Logic =====
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

async function importPCsIfNeeded() {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM branch_pcs');
    if (result.rows[0].count === '0' && fs.existsSync(csvPath)) {
      const data = fs.readFileSync(csvPath, 'utf8');
      const lines = data.split(/\r?\n/).filter(l => l.trim().length > 0);
      let headerIdx = lines.findIndex(l => l.includes('BRANCH NAME'));
      if (headerIdx === -1) return;
      for (let i = headerIdx + 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        if (row.length < 11 || !row[0]) continue;
        await pool.query(
          `INSERT INTO branch_pcs (branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          row.slice(0, 11)
        );
      }
      console.log('✅ PC specs imported from CSV.');
    }
  } catch (err) {
    console.error("❌ Error importing PCs:", err);
  }
}

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== Initialize Tables =====
async function initTables() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      taskName TEXT,
      branchName TEXT,
      description TEXT,
      status TEXT
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS materials (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT,
      taskId INTEGER REFERENCES tasks(id)
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS branch_pcs (
      id SERIAL PRIMARY KEY,
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
    await importPCsIfNeeded();
    console.log("✅ Tables initialized.");
  } catch (err) {
    console.error("❌ Error initializing tables:", err);
  }
}
initTables();

// ===== TASKS API =====
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    const tasks = result.rows.map(t => ({
      id: t.id,
      taskName: t.task_name,      // map snake_case → camelCase
      branchName: t.branch_name,
      description: t.description,
      status: t.status
    }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tasks', async (req, res) => {
  const { taskName, branchName, description, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (taskName, branchName, description, status) VALUES ($1,$2,$3,$4) RETURNING id',
      [taskName, branchName, description, status]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MATERIALS API =====
app.get('/materials', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materials');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/materials', async (req, res) => {
  const { name, quantity, unit, taskId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO materials (name, quantity, unit, taskId) VALUES ($1,$2,$3,$4) RETURNING id',
      [name, quantity, unit, taskId || null]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/materials/:id', async (req, res) => {
  const { name, quantity, unit, taskId } = req.body;
  try {
    const result = await pool.query(
      'UPDATE materials SET name=$1, quantity=$2, unit=$3, taskId=$4 WHERE id=$5',
      [name, quantity, unit, taskId || null, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Material not found' });
    res.json({ message: 'Material updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/materials/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM materials WHERE id=$1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Material not found' });
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== BRANCH PCS API =====
app.get('/pcs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branch_pcs');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/pcs', async (req, res) => {
  const { branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO branch_pcs (branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id',
      [branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/pcs/:id', async (req, res) => {
  const { branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor } = req.body;
  try {
    const result = await pool.query(
      'UPDATE branch_pcs SET branch_name=$1, city=$2, branch_code=$3, desktop_name=$4, pc_number=$5, motherboard=$6, processor=$7, storage=$8, ram=$9, psu=$10, monitor=$11 WHERE id=$12',
      [branch_name, city, branch_code, desktop_name, pc_number, motherboard, processor, storage, ram, psu, monitor, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'PC spec not found' });
    res.json({ message: 'PC spec updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/pcs/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM branch_pcs WHERE id=$1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'PC spec not found' });
    res.json({ message: 'PC spec deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});   // ✅ this closes the route
// ⬆️ but after this your file just ends — no app.listen()
// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

