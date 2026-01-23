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

    -- Core identity
    file_no TEXT UNIQUE,
    client_name TEXT NOT NULL,
    mobile_no TEXT,
    email TEXT,
    client_group_name TEXT,

    -- Internal control
    admin_group_id INTEGER NOT NULL,
    assigned_employee_id INTEGER,

    -- Services
    services_opted TEXT CHECK(services_opted IN ('GST','INCOME_TAX','BOTH')) NOT NULL,

    -- GST fields
    gstin TEXT,
    gst_user_id TEXT,
    gst_password TEXT,
    gst_filing_type TEXT CHECK(gst_filing_type IN ('MONTHLY','QUARTERLY')),

    -- Income Tax fields
    itr_v_status TEXT,
    audit_status TEXT,
    file_status TEXT,
    fees_amount INTEGER,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admin_group_id) REFERENCES users(id),
    FOREIGN KEY (assigned_employee_id) REFERENCES users(id)
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
