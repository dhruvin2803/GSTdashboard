const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const logAudit = require("../utils/auditLogger");

const router = express.Router();

/* REGISTER (TEMPORARY) */
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!["admin", "employee"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    db.prepare(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)"
    ).run(email, hashedPassword, role);

    res.json({ message: "User registered successfully" });
  } catch {
    res.status(400).json({ message: "User already exists" });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token, role: user.role, email: user.email });
  logAudit(user.id, "LOGIN", "User logged in");
});

module.exports = router;
