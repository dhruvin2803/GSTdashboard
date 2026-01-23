import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AuditLogsTable from "../components/AuditLogsTable";

const API_URL = "http://localhost:5000";

function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const createEmployee = async () => {
    setMessage("");

    if (!email || !password) {
      setMessage("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/admin/create-employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create employee");
      }

      setMessage("Employee created successfully");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Create Employee */}
        <div className="max-w-md bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-medium mb-6">
            Create Employee
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Employee Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Temporary Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={createEmployee}
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>

            {message && (
              <p
                className={`text-sm ${
                  message.includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Audit Logs */}
        <AuditLogsTable />
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
