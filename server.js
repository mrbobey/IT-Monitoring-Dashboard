const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const session = require('express-session');

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
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'it-dashboard-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files (CSS, JS, images) but NOT HTML pages
app.use('/style.css', express.static(path.join(__dirname, 'public', 'style.css')));
app.use('/script.js', express.static(path.join(__dirname, 'public', 'script.js')));
app.use('/pcs.js', express.static(path.join(__dirname, 'public', 'pcs.js')));
app.use('/inventory.js', express.static(path.join(__dirname, 'public', 'inventory.js')));
app.use('/auth.js', express.static(path.join(__dirname, 'public', 'auth.js')));
app.use('/manifest.json', express.static(path.join(__dirname, 'public', 'manifest.json')));
app.use('/Copy of BRANCHES PC SPECS.csv', express.static(path.join(__dirname, 'public', 'Copy of BRANCHES PC SPECS.csv')));

// Auth middleware
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// ===== ROUTE HANDLERS =====
// Root redirect
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/index.html");
  }
  res.redirect("/login");
});

// Public routes - Login and Register
app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/index.html");
  }
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/login.html", (req, res) => {
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  if (req.session.user) {
    return res.redirect("/index.html");
  }
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/register.html", (req, res) => {
  res.redirect("/register");
});

// Protected routes - Require login
app.get("/index.html", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/inventory.html", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "inventory.html"));
});

app.get("/pcs.html", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pcs.html"));
});

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

    // Create users table for authentication
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'User',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
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

// ===== AUTHENTICATION API =====
// Note: Sessions are now managed by express-session middleware

// Middleware to check authentication for API endpoints
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = req.session.user;
  next();
}

// Register new user
app.post('/auth/register', async (req, res) => {
  const { full_name, email, username, password } = req.body;
  
  try {
    // Validate input
    if (!full_name || !email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, username, password_hash, role) 
       VALUES ($1, $2, $3, $4, 'User') RETURNING id, full_name, email, username, role, created_at`,
      [full_name, email, username, password_hash]
    );
    
    const user = result.rows[0];
    
    // Store user in session
    req.session.user = {
      userId: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    };
    
    res.json({
      success: true,
      message: 'Registration successful',
      redirect: '/index.html'
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user (can login with email or username)
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    // Store user in session
    req.session.user = {
      userId: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    };
    
    res.json({
      success: true,
      message: 'Login successful',
      redirect: '/index.html'
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Logout user
app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true, message: 'Logged out successfully', redirect: '/login' });
  });
});

// Check authentication status
app.get('/auth/session', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ authenticated: false });
  }
  
  res.json({
    authenticated: true,
    user: req.session.user
  });
});

// Get current user profile
app.get('/auth/profile', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, username, role, created_at, last_login FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
