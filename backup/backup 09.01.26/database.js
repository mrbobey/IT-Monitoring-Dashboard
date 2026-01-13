const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tasks.db');

// Create tasks table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskName TEXT NOT NULL,
        branchName TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL
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

module.exports = db;
