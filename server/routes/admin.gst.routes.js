const express = require("express");
const authMiddleware = require("../middleware/auth");
const logAudit = require("../utils/auditLogger");

const {
  requestGstOtp,
  verifyGstOtp,
} = require("../services/gst/gst_auth.service");

const { fetchGstrStatus } = require("../services/gst/gstr_status.service");

const router = express.Router();

/* 
  GST routes must be:
  - Authenticated
  - Admin-only
*/
router.use(authMiddleware);

router.use((req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
});

/**
 * STEP 3.1 — Request GST OTP (dummy for now)
 */
router.post("/:client_id/otp", async (req, res) => {
  try {
    await requestGstOtp(req.params.client_id, req.user.id);
    res.json({ message: "GST OTP sent successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * STEP 3.2 — Verify GST OTP (dummy)
 */
router.post("/:client_id/verify-otp", async (req, res) => {
  try {
    await verifyGstOtp(req.params.client_id, req.body.otp, req.user.id);
    res.json({ message: "GST authorized successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * STEP 3.3 — Fetch GSTR return status (dummy)
 */
router.get("/:client_id/returns", async (req, res) => {
  try {
    const data = await fetchGstrStatus(
      req.params.client_id,
      req.user.id
    );
    res.json({ returns: data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
