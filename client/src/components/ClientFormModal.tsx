import { useEffect, useState } from "react";
import type { Client } from "../types/type";

interface Props {
  onClose: () => void;
  client?: Client;
}

export default function ClientFormModal({ onClose, client }: Props) {
  const [form, setForm] = useState<Partial<Client>>({});

  useEffect(() => {
    if (client) setForm(client);
  }, [client]);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const url = client
      ? `http://localhost:5000/admin/clients/${client.id}`
      : "http://localhost:5000/admin/clients";

    const method = client ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      console.error("Failed to save client");
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          {client ? "Edit Client" : "Add Client"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {[
            ["file_no", "File No"],
            ["full_name", "Full Name"],
            ["gst_no", "GST No"],
            ["mobile_no", "Mobile No"],
            ["login_id", "Login ID (info)"],
            ["password", "Password (info)"],
            ["pan_no", "PAN No"],
          ].map(([key, label]) => (
            <input
              key={key}
              placeholder={label}
              value={(form as any)[key] || ""}
              className="border p-2 rounded"
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
            />
          ))}

          <select
            value={form.payment_type || ""}
            className="border p-2 rounded"
            onChange={(e) =>
              setForm({ ...form, payment_type: e.target.value as any })
            }
          >
            <option value="">Payment Type</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
          </select>

          <select
            value={form.work_alloted_to || ""}
            className="border p-2 rounded"
            onChange={(e) =>
              setForm({ ...form, work_alloted_to: e.target.value })
            }
          >
            <option value="">Work Allotted To</option>
            <option value="employee1">Employee 1</option>
          </select>

          <select
            value={form.group_from || ""}
            className="border p-2 rounded"
            onChange={(e) =>
              setForm({ ...form, group_from: e.target.value })
            }
          >
            <option value="">Group From</option>
            <option value="admin1">Admin 1</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
