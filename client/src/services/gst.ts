const API_URL = "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function requestGstOtp(client_id: number) {
  const res = await fetch(`${API_URL}/admin/gst/${client_id}/otp`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message);
  }

  return res.json();
}

export async function verifyGstOtp(client_id: number, otp: string) {
  const res = await fetch(`${API_URL}/admin/gst/${client_id}/verify-otp`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ otp }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message);
  }

  return res.json();
}

export async function fetchGstrReturns(client_id: number) {
  const res = await fetch(`${API_URL}/admin/gst/${client_id}/returns`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message);
  }

  const json = await res.json();
  return json.returns; // ✅ CORRECT
}
