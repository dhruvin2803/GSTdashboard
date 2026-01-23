import { useEffect, useState } from "react";

type AuditLog = {
  id: number;
  user_email: string;
  action: string;
  details: string;
  timestamp: string;
};

const API_URL = "http://localhost:5000";

function AuditLogsTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/admin/audit-logs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.user_email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">
          Audit Logs
        </h2>

        <input
          type="text"
          placeholder="Filter by user or action"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">
          Loading audit logs...
        </p>
      ) : filteredLogs.length === 0 ? (
        <p className="text-sm text-slate-500">
          No audit logs found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Details</th>
                <th className="py-2">Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-2 pr-4 font-mono text-xs">
                    {log.user_email}
                  </td>

                  <td className="py-2 pr-4 font-medium">
                    {log.action}
                  </td>

                  <td className="py-2 pr-4 text-slate-600">
                    {log.details}
                  </td>

                  <td className="py-2 text-xs text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AuditLogsTable;
