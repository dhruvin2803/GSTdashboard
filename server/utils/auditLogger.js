const db = require("../db");

function logAudit(userId, action, details = "") {
  db.prepare(
    "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)"
  ).run(userId, action, details);
}

module.exports = logAudit;
