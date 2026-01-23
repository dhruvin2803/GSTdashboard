const express = require("express");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.use((req, res, next) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({ message: "Employees only" });
  }
  next();
});

router.get("/dashboard", (req, res) => {
  res.json({ message: "Welcome Employee" });
});

module.exports = router;
