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
      taskId INTEGER REFERENCES tasks(id),
      part_type TEXT,
      status TEXT DEFAULT 'Available',
      serial_number TEXT,
      warranty_date TEXT,
      condition TEXT DEFAULT 'Good',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Add missing columns to existing materials table if they don't exist
    const columnsToAdd = [
      { name: 'part_type', definition: 'TEXT' },
      { name: 'status', definition: "TEXT DEFAULT 'Available'" },
      { name: 'serial_number', definition: 'TEXT' },
      { name: 'warranty_date', definition: 'TEXT' },
      { name: 'condition', definition: "TEXT DEFAULT 'Good'" },
      { name: 'created_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    for (const col of columnsToAdd) {
      try {
        await pool.query(`ALTER TABLE materials ADD COLUMN IF NOT EXISTS ${col.name} ${col.definition}`);
      } catch (colErr) {
        // Column might already exist, continue
        console.log(`Column ${col.name} check:`, colErr.message);
      }
    }
    
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
    // CSV import disabled - commented out as per requirements
    // await importPCsIfNeeded();
    console.log("✅ Tables initialized.");
  } catch (err) {
    console.error("❌ Error initializing tables:", err);
  }
}
initTables();

// ===== TASKS API =====
// GET all tasks
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    console.log("✅ Raw rows from DB:", result.rows);
    
    // Map snake_case DB fields → camelCase JSON
    const tasks = result.rows.map(t => ({
      id: t.id,
      taskName: t.task_name,      // ✅ mapped
      branchName: t.branch_name,  // ✅ mapped
      description: t.description,
      status: t.status
    }));

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST new task
app.post('/tasks', async (req, res) => {
  const { taskName, branchName, description, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tasks (task_name, branch_name, description, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [taskName, branchName, description, status]
    );

    // Return camelCase JSON for the new task
    const t = result.rows[0];
    res.json({
      id: t.id,
      taskName: t.task_name,
      branchName: t.branch_name,
      description: t.description,
      status: t.status
    });
  } catch (err) {
    console.error('Error adding task:', err);
    res.status(500).json({ error: 'Failed to add task' });
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
});

// ===== INVENTORY API (using materials table) =====
// GET all inventory items
app.get('/inventory', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materials ORDER BY created_at DESC');
    // Map database fields to frontend format
    const inventory = result.rows.map(item => ({
      id: item.id,
      part_type: item.part_type || 'Other',
      part_name: item.name,
      quantity: item.quantity,
      status: item.status || 'Available',
      serial_number: item.serial_number,
      warranty_date: item.warranty_date,
      condition: item.condition || 'Good',
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
    res.json(inventory);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// GET inventory summary (counts by status/type)
app.get('/inventory/summary', async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM materials WHERE part_type IS NOT NULL');
    const availableResult = await pool.query("SELECT COUNT(*) as available FROM materials WHERE status = 'Available'");
    const dispatchedResult = await pool.query("SELECT COUNT(*) as dispatched FROM materials WHERE status = 'Dispatched'");
    const attentionResult = await pool.query("SELECT COUNT(*) as attention FROM materials WHERE status = 'Needs Attention'");
    
    const typeResult = await pool.query(
      `SELECT part_type, COUNT(*) as count FROM materials WHERE part_type IS NOT NULL GROUP BY part_type ORDER BY part_type`
    );

    res.json({
      total: parseInt(totalResult.rows[0].total),
      available: parseInt(availableResult.rows[0].available),
      dispatched: parseInt(dispatchedResult.rows[0].dispatched),
      needsAttention: parseInt(attentionResult.rows[0].attention),
      byType: typeResult.rows
    });
  } catch (err) {
    console.error('Error fetching inventory summary:', err);
    res.status(500).json({ error: 'Failed to fetch inventory summary' });
  }
});

// POST new inventory item
app.post('/inventory', async (req, res) => {
  const { part_type, part_name, quantity, status, serial_number, warranty_date, condition } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO materials (name, quantity, part_type, status, serial_number, warranty_date, condition)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [part_name, quantity, part_type, status || 'Available', serial_number, warranty_date, condition || 'Good']
    );
    // Map back to frontend format
    const item = result.rows[0];
    res.json({
      id: item.id,
      part_type: item.part_type,
      part_name: item.name,
      quantity: item.quantity,
      status: item.status,
      serial_number: item.serial_number,
      warranty_date: item.warranty_date,
      condition: item.condition,
      created_at: item.created_at,
      updated_at: item.updated_at
    });
  } catch (err) {
    console.error('Error adding inventory item:', err);
    res.status(500).json({ error: 'Failed to add inventory item' });
  }
});

// PUT update inventory item
app.put('/inventory/:id', async (req, res) => {
  const { part_type, part_name, quantity, status, serial_number, warranty_date, condition } = req.body;
  try {
    const result = await pool.query(
      `UPDATE materials SET name=$1, quantity=$2, part_type=$3, status=$4, serial_number=$5, warranty_date=$6, condition=$7, updated_at=CURRENT_TIMESTAMP
       WHERE id=$8 RETURNING *`,
      [part_name, quantity, part_type, status, serial_number, warranty_date, condition, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Inventory item not found' });
    // Map back to frontend format
    const item = result.rows[0];
    res.json({
      id: item.id,
      part_type: item.part_type,
      part_name: item.name,
      quantity: item.quantity,
      status: item.status,
      serial_number: item.serial_number,
      warranty_date: item.warranty_date,
      condition: item.condition,
      updated_at: item.updated_at
    });
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// DELETE inventory item
app.delete('/inventory/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM materials WHERE id=$1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Inventory item not found' });
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

