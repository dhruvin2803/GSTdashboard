const Database = require("better-sqlite3");
require("dotenv").config();

const db = new Database(process.env.DB_PATH);

// 1. Create tables
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'employee')) NOT NULL
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_no TEXT,
    full_name TEXT,
    gst_no TEXT,
    mobile_no TEXT,
    work_alloted_to TEXT,
    group_from TEXT,
    login_id TEXT,
    password TEXT,
    pan_no TEXT,
    payment_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS gst_auth_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL UNIQUE,
    gstin TEXT NOT NULL,
    gst_username TEXT NOT NULL,
    txn TEXT,
    auth_status TEXT CHECK(auth_status IN ('never','active','expired')) 
      NOT NULL DEFAULT 'never',
    last_auth_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  )
`,
).run();
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS gstr_return_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    gstin TEXT NOT NULL,
    return_type TEXT NOT NULL,
    tax_period TEXT NOT NULL,
    filing_status TEXT NOT NULL,
    filed_date TEXT,
    filed_by TEXT,
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  )
`,
).run();

module.exports = db;
