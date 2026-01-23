const db = require("../../db");
const whitebooksClient = require("./whitebooks.client");
const logAudit = require("../../utils/auditLogger");

async function fetchGstrStatus(client_id, user_id) {
  const client = db
    .prepare("SELECT * FROM clients WHERE id = ?")
    .get(client_id);

  const auth = db
    .prepare("SELECT * FROM gst_auth_sessions WHERE client_id = ?")
    .get(client_id);

  if (!auth || auth.auth_status !== "active") {
    throw new Error("GST authorization required");
  }

  // Example: current return period MMYYYY
  const now = new Date();
  const ret_period =
    String(now.getMonth() + 1).padStart(2, "0") + now.getFullYear();

  const ref_id = Math.random().toString(36).substring(2, 17);

  const response = await whitebooksClient.get("/gstr/retstatus", {
    params: {
      gstin: client.gst_no,
      returnperiod: ret_period,
      refid: ref_id,
      email: client.mobile_no,
    },
    headers: {
      gst_username: auth.gst_username,
      state_cd: client.gst_no.substring(0, 2),
      ip_address: process.env.GST_IP_ADDRESS,
      txn: auth.txn,
      client_id: process.env.GST_CLIENT_ID,
      client_secret: process.env.GST_CLIENT_SECRET,
    },
  });

  const data = response.data;
  // Normalize filing status (VERY IMPORTANT)
  let filing_status = "NOT_FILED";

  if (data?.status_cd) {
    filing_status = data.status_cd;
  } else if (data?.status) {
    filing_status = data.status;
  }

  db.prepare(
    `
    DELETE FROM gstr_return_status
    WHERE client_id=?
  `,
  ).run(client_id);

  console.log("===== GSTR STATUS DEBUG =====");
  console.log(
    "RAW RESPONSE:",
    typeof response.data,
    JSON.stringify(response.data, null, 2),
  );
  console.log("============================");

  db.prepare(
    `
  INSERT INTO gstr_return_status
    (client_id, gstin, return_type, tax_period, filing_status)
  VALUES (?, ?, ?, ?, ?)
`,
  ).run(
    client_id,
    client.gst_no,
    data.form_typ || "GSTR",
    ret_period,
    filing_status,
  );

  logAudit(
    user_id,
    "GST_STATUS_FETCH",
    `Fetched return status for GSTIN ${client.gst_no}`,
  );

  // Normalize final response for frontend
  let result = {
    ret_period,
    form_typ: data.form_typ || "GSTR1",
    status_cd: "NOT_FILED",
    message: "Return not filed yet",
  };

  // GST success
  if (data.status_cd === "P") {
    result.status_cd = "FILED";
    result.message = "Return filed successfully";
  }

  // Filed with errors
  else if (data.status_cd === "PE") {
    result.status_cd = "FILED_WITH_ERRORS";
    result.message = "Return filed with errors";
  }

  // GST error but meaningful (NO RECORD)
  else if (data.error?.error_cd === "RET13510") {
    result.status_cd = "NOT_FILED";
    result.message = "NO";
  }

  // Other GST errors
  else if (data.status_cd === "ER" || data.status_cd === "0") {
    result.status_cd = "ERROR";
    result.message = data.error?.message || "GST error occurred";
  }

  console.log("result: ", result);
  return result;
}

module.exports = { fetchGstrStatus };
