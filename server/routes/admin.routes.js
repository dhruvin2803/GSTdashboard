const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const authMiddleware = require("../middleware/auth");
const logAudit = require("../utils/auditLogger");

const router = express.Router();

// Must be logged in
router.use(authMiddleware);

// Must be admin
router.use((req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
});

/* CREATE EMPLOYEE */
router.post("/create-employee", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    db.prepare(
      "INSERT INTO users (email, password, role) VALUES (?, ?, 'employee')",
    ).run(email, hashedPassword);

    res.json({ message: "Employee created successfully" });
    logAudit(req.user.id, "CREATE_EMPLOYEE", `Created employee ${email}`);
  } catch {
    res.status(400).json({ message: "Employee already exists" });
  }
});

router.get("/dashboard", (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.get("/audit-logs", (req, res) => {
  const logs = db
    .prepare(
      `
    SELECT 
      audit_logs.id,
      users.email AS user_email,
      audit_logs.action,
      audit_logs.details,
      audit_logs.timestamp
    FROM audit_logs
    JOIN users ON users.id = audit_logs.user_id
    ORDER BY audit_logs.timestamp DESC
    LIMIT 100
  `,
    )
    .all();

  res.json(logs);
});

router.post("/clients", (req, res) => {
  const {
    file_no,
    client_name,
    mobile_no,
    email,
    client_group_name,

    admin_group_id,
    assigned_employee_id,

    services_opted,

    gstin,
    gst_user_id,
    gst_password,
    gst_filing_type,

    itr_v_status,
    audit_status,
    file_status,
    fees_amount
  } = req.body;

  if (!file_no || !client_name || !admin_group_id || !services_opted) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const result = db.prepare(`
    INSERT INTO clients (
      file_no,
      client_name,
      mobile_no,
      email,
      client_group_name,
      admin_group_id,
      assigned_employee_id,
      services_opted,
      gstin,
      gst_user_id,
      gst_password,
      gst_filing_type,
      itr_v_status,
      audit_status,
      file_status,
      fees_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    file_no,
    client_name,
    mobile_no || null,
    email || null,
    client_group_name || null,
    admin_group_id,
    assigned_employee_id || null,
    services_opted,
    gstin || null,
    gst_user_id || null,
    gst_password || null,
    gst_filing_type || null,
    itr_v_status || null,
    audit_status || null,
    file_status || null,
    fees_amount || null
  );

  logAudit(
    req.user.id,
    "CREATE_CLIENT",
    `Client created (ID: ${result.lastInsertRowid}, FILE: ${file_no})`
  );

  res.json({
    message: "Client created successfully",
    client_id: result.lastInsertRowid
  });
});

router.get("/clients", (req, res) => {
  const clients = db.prepare(`
    SELECT *
    FROM clients
    ORDER BY created_at DESC
  `).all();

  res.json(clients);
});


/* DELETE CLIENT */
router.delete("/clients/:id", (req, res) => {
  const { id } = req.params;

  const result = db
    .prepare("DELETE FROM clients WHERE id = ?")
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({ message: "Client not found" });
  }

  logAudit(
    req.user.id,
    "DELETE_CLIENT",
    `Client deleted (ID: ${id})`
  );

  res.json({ message: "Client deleted successfully" });
});

// Update Client
router.put("/clients/:id", (req, res) => {
  const { id } = req.params;

  const {
    file_no,
    client_name,
    mobile_no,
    email,
    client_group_name,
    admin_group_id,
    assigned_employee_id,
    services_opted,
    gstin,
    gst_user_id,
    gst_password,
    gst_filing_type,
    itr_v_status,
    audit_status,
    file_status,
    fees_amount
  } = req.body;

  const result = db.prepare(`
    UPDATE clients SET
      file_no = ?,
      client_name = ?,
      mobile_no = ?,
      email = ?,
      client_group_name = ?,
      admin_group_id = ?,
      assigned_employee_id = ?,
      services_opted = ?,
      gstin = ?,
      gst_user_id = ?,
      gst_password = ?,
      gst_filing_type = ?,
      itr_v_status = ?,
      audit_status = ?,
      file_status = ?,
      fees_amount = ?
    WHERE id = ?
  `).run(
    file_no,
    client_name,
    mobile_no || null,
    email || null,
    client_group_name || null,
    admin_group_id,
    assigned_employee_id || null,
    services_opted,
    gstin || null,
    gst_user_id || null,
    gst_password || null,
    gst_filing_type || null,
    itr_v_status || null,
    audit_status || null,
    file_status || null,
    fees_amount || null,
    id
  );

  if (result.changes === 0) {
    return res.status(404).json({ message: "Client not found" });
  }

  logAudit(req.user.id, "UPDATE_CLIENT", `Client updated (ID: ${id})`);

  res.json({ message: "Client updated successfully" });
});

router.get("/admins", (req, res) => {
  const admins = db
    .prepare("SELECT id, email FROM users WHERE role = 'admin'")
    .all();
  res.json(admins);
});


router.get("/employees", (req, res) => {
  const employees = db
    .prepare("SELECT id, email FROM users WHERE role = 'employee'")
    .all();
  res.json(employees);
});

// GET distinct client groups
router.get("/client-groups", (req, res) => {
  const groups = db.prepare(`
    SELECT DISTINCT client_group_name
    FROM clients
    WHERE client_group_name IS NOT NULL
      AND client_group_name != ''
    ORDER BY client_group_name ASC
  `).all();

  res.json(groups.map(g => g.client_group_name));
});



// // 2. SEED ADMIN USER (With Bcrypt Hashing)
// const seedAdmin = async () => {
//   const adminEmail = 'dhruvinbhayani000@gmail.com';
//   const plainPassword = '1234';
  
//   const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

//   if (!existingUser) {
//     // Hash the password so the login route can verify it
//     const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
//     db.prepare(`
//       INSERT INTO users (email, password, role) 
//       VALUES (?, ?, ?)
//     `).run(adminEmail, hashedPassword, 'admin');
    
//     console.log(`✅ Admin user ${adminEmail} created with hashed password.`);
//   }
// };

// seedAdmin();


module.exports = router;
