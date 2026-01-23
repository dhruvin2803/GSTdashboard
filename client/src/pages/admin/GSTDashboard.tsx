import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  fetchGstrReturns,
  requestGstOtp,
  verifyGstOtp,
} from "../../services/gst";
import type { Client } from "../../types/type";

type GstrStatus = {
  form_typ: string; // R1, R3B
  status_cd: string; // P, PE, ER
  ret_period: string; // MMYYYY
  message:string;
};

function GSTDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [gstrData, setGstrData] = useState<Record<number, GstrStatus>>({});
  const [error, setError] = useState<string | null>(null);
  const [otpClientId, setOtpClientId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const submitOtp = async () => {
    if (!otpClientId) return;

    try {
      await verifyGstOtp(otpClientId, otp);
      setOtpClientId(null);
      setOtp("");
      alert("GST Authorized successfully. Now click Refresh.");
    } catch (err: any) {
      setOtpError(err.message);
    }
  };

  // Load clients
  useEffect(() => {
    fetch("http://localhost:5000/admin/clients", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(setClients);
  }, []);

  const loadReturns = async (client_id: number) => {
    try {
      const data = await fetchGstrReturns(client_id);
      setGstrData((prev) => ({
        ...prev,
        [client_id]: data,
      }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const authorizeGst = async (client_id: number) => {
    try {
      await requestGstOtp(client_id);
      setOtpClientId(client_id);
      setOtp("");
      setOtpError(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout title="GST Dashboard">
      <h1 className="text-xl font-semibold mb-4">GST Return Status</h1>

      {error && <div className="bg-red-100 text-red-700 p-2 mb-4">{error}</div>}

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Client</th>
            <th className="border p-2">GSTIN</th>
            <th className="border p-2">Returns</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="border p-2">{client.full_name}</td>
              <td className="border p-2">{client.gst_no}</td>
              <td className="border p-2">
                {gstrData[client.id] ? (
                  <div>
                    <strong>{gstrData[client.id].form_typ}</strong>
                    <div className="text-sm text-gray-700">
                      {gstrData[client.id].message}
                    </div>
                  </div>
                ) : (
                  "—"
                )}
              </td>
              <td className="border p-2">
                <button
                  className="bg-blue-600 text-white px-2 py-1 mr-2"
                  onClick={() => loadReturns(client.id)}
                >
                  Refresh
                </button>
                <button
                  className="bg-yellow-600 text-white px-2 py-1"
                  onClick={() => authorizeGst(client.id)}
                >
                  Authorize GST
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {otpClientId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="text-lg font-semibold mb-2">Enter GST OTP</h2>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border w-full p-2 mb-2"
              placeholder="Enter OTP"
            />

            {otpError && (
              <div className="text-red-600 text-sm mb-2">{otpError}</div>
            )}

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 border"
                onClick={() => setOtpClientId(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white"
                onClick={submitOtp}
              >
                Verify OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default GSTDashboard;
