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

/* CREATE CLIENT */
router.post("/clients", (req, res) => {
  const {
    file_no,
    full_name,
    gst_no,
    mobile_no,
    work_alloted_to,
    group_from,
    login_id,
    password,
    pan_no,
    payment_type,
  } = req.body;

  const result = db
    .prepare(
      `
      INSERT INTO clients (
        file_no,
        full_name,
        gst_no,
        mobile_no,
        work_alloted_to,
        group_from,
        login_id,
        password,
        pan_no,
        payment_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
    .run(
      file_no || null,
      full_name || null,
      gst_no || null,
      mobile_no || null,
      work_alloted_to || null,
      group_from || null,
      login_id || null,
      password || null,
      pan_no || null,
      payment_type || null,
    );

  logAudit(
    req.user.id,
    "CREATE_CLIENT",
    `Client created (ID: ${result.lastInsertRowid})`,
  );

  res.json({
    message: "Client created successfully",
    clientId: result.lastInsertRowid,
  });
});

router.get("/clients", (req, res) => {
  const clients = db
    .prepare(
      `
      SELECT
        id,
        file_no,
        full_name,
        gst_no,
        mobile_no,
        work_alloted_to,
        group_from,
        login_id,
        password,
        pan_no,
        payment_type,
        created_at
      FROM clients
      ORDER BY id ASC
    `,
    )
    .all();
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

/* UPDATE CLIENT */
router.put("/clients/:id", (req, res) => {
  const { id } = req.params;

  const {
    file_no,
    full_name,
    gst_no,
    mobile_no,
    work_alloted_to,
    group_from,
    login_id,
    password,
    pan_no,
    payment_type,
  } = req.body;

  const result = db
    .prepare(`
      UPDATE clients SET
        file_no = ?,
        full_name = ?,
        gst_no = ?,
        mobile_no = ?,
        work_alloted_to = ?,
        group_from = ?,
        login_id = ?,
        password = ?,
        pan_no = ?,
        payment_type = ?
      WHERE id = ?
    `)
    .run(
      file_no || null,
      full_name || null,
      gst_no || null,
      mobile_no || null,
      work_alloted_to || null,
      group_from || null,
      login_id || null,
      password || null,
      pan_no || null,
      payment_type || null,
      id
    );

  if (result.changes === 0) {
    return res.status(404).json({ message: "Client not found" });
  }

  logAudit(
    req.user.id,
    "UPDATE_CLIENT",
    `Client updated (ID: ${id})`
  );

  res.json({ message: "Client updated successfully" });
});


module.exports = router;
