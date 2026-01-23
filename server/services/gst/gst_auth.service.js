const db = require("../../db");
const whitebooksClient = require("./whitebooks.client");
const logAudit = require("../../utils/auditLogger");

/**
 * STEP 1 — Request OTP
 */
async function requestGstOtp(client_id, user_id) {
  const client = db
    .prepare("SELECT * FROM clients WHERE id = ?")
    .get(client_id);

  if (!client || !client.gst_no || !client.login_id || !client.mobile_no) {
    throw new Error("GST details missing");
  }

  // Check existing auth session
  const existing = db
    .prepare("SELECT * FROM gst_auth_sessions WHERE client_id = ?")
    .get(client_id);

  // 🔁 Try refresh token FIRST
  if (existing && existing.auth_status === "active") {
    return { reused: true };
  }

  try {
    const response = await whitebooksClient.get("/authentication/otprequest", {
      params: {
        email: client.mobile_no, // sandbox email
      },
      headers: {
        gst_username: client.login_id,
        state_cd: client.gst_no.substring(0, 2),
        ip_address: process.env.GST_IP_ADDRESS,
      },
    });

    const txn = response.data?.header?.txn;

    if (!txn) {
      // 🔴 This is your current error
      if (response.data?.error?.error_cd === "AUTH403") {
        throw new Error(
          "Whitebooks sandbox session limit reached. Please wait 15–30 minutes or reuse existing session.",
        );
      }

      throw new Error("Failed to generate OTP (txn missing)");
    }

    db.prepare(
      `
      INSERT INTO gst_auth_sessions
        (client_id, gstin, gst_username, txn, auth_status)
      VALUES (?, ?, ?, ?, 'expired')
      ON CONFLICT(client_id)
      DO UPDATE SET txn=excluded.txn, auth_status='expired'
    `,
    ).run(client_id, client.gst_no, client.login_id, txn);

    logAudit(
      user_id,
      "GST_AUTH_REQUIRED",
      `OTP requested for GSTIN ${client.gst_no}`,
    );

    return { otp_sent: true };
  } catch (err) {
    throw err;
  }
}

/**
 * STEP 2 — Verify OTP
 */
async function verifyGstOtp(client_id, otp, user_id) {
  // 🔹 Fetch client (THIS WAS MISSING)
  const client = db
    .prepare("SELECT * FROM clients WHERE id = ?")
    .get(client_id);

  if (!client || !client.mobile_no) {
    throw new Error("Client email missing");
  }

  const auth = db
    .prepare("SELECT * FROM gst_auth_sessions WHERE client_id = ?")
    .get(client_id);

  if (!auth || !auth.txn) {
    throw new Error("OTP not requested for this client");
  }

  const response = await whitebooksClient.get("/authentication/authtoken", {
    params: {
      email: client.mobile_no, // ✅ now valid
      otp,
    },
    headers: {
      gst_username: auth.gst_username,
      txn: auth.txn,
      state_cd: auth.gstin.substring(0, 2),
      ip_address: process.env.GST_IP_ADDRESS,
    },
  });

  // 🔍 DEBUG LOGS (these WILL show now)
  console.log("===== WHITEBOOKS OTP VERIFY DEBUG =====");
  console.log("CLIENT ID:", client_id);
  console.log("GST USERNAME:", auth.gst_username);
  console.log("EMAIL USED:", client.mobile_no);
  console.log("TXN USED:", auth.txn);
  console.log("OTP ENTERED:", otp);
  console.log("WHITEBOOKS RESPONSE:", JSON.stringify(response.data, null, 2));
  console.log("======================================");

  if (response.data?.status_cd !== "1") {
    throw new Error("OTP verification failed");
  }

  db.prepare(
    `
    UPDATE gst_auth_sessions
    SET auth_status='active', last_auth_at=CURRENT_TIMESTAMP
    WHERE client_id=?
  `,
  ).run(client_id);

  logAudit(
    user_id,
    "GST_AUTH_SUCCESS",
    `GST authorized for GSTIN ${auth.gstin}`,
  );

  return true;
}

module.exports = {
  requestGstOtp,
  verifyGstOtp,
};
