import { useState } from "react";
import type { Client } from "../types/type";

interface Props {
  clients: Client[];
  onDelete: (id: number) => void;
  onEdit: (client: Client) => void;
}

type SortKey = keyof Client | null;
type SortDir = "asc" | "desc";

const COLUMNS: { key: keyof Client; label: string }[] = [
  { key: "file_no", label: "File No" },
  { key: "full_name", label: "Full Name" },
  { key: "gst_no", label: "GST No" },
  { key: "mobile_no", label: "Mobile" },
  { key: "pan_no", label: "PAN" },
  { key: "payment_type", label: "Payment" },
  { key: "work_alloted_to", label: "Work Alloted" },
  { key: "group_from", label: "Group From" },
];

export default function ClientsTable({
  clients,
  onDelete,
  onEdit,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  /* ----------------------------- SORTING ----------------------------- */

  const handleSort = (key: keyof Client) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    if (!sortKey) return 0;
    const v1 = a[sortKey] ?? "";
    const v2 = b[sortKey] ?? "";
    return sortDir === "asc" ? (v1 > v2 ? 1 : -1) : v1 < v2 ? 1 : -1;
  });

  /* ------------------------------- UI ------------------------------- */

  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm border-collapse select-text">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="border px-3 py-2">Sr</th>

            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onDoubleClick={() => handleSort(col.key)}
                title="Double-click to sort"
                className="border px-3 py-2 cursor-default whitespace-nowrap hover:bg-gray-200"
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {sortKey === col.key && (
                    <span className="text-xs">
                      {sortDir === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
              </th>
            ))}

            <th className="border px-3 py-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {sortedClients.map((c, i) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{i + 1}</td>

              {COLUMNS.map((col) => (
                <td
                  key={col.key}
                  className="border px-3 py-2 select-text"
                >
                  {c[col.key]}
                </td>
              ))}

              <td className="border px-3 py-2 text-center whitespace-nowrap">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onEdit(c)}
                  className="text-blue-600 hover:underline mr-2"
                >
                  Edit
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (window.confirm("Delete this client?")) {
                      onDelete(c.id);
                    }
                  }}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {sortedClients.length === 0 && (
            <tr>
              <td
                colSpan={COLUMNS.length + 2}
                className="border px-4 py-6 text-center text-gray-500"
              >
                No clients found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
