import { useState } from "react";
import type { Client } from "../types/type";

interface Props {
  clients: Client[];
  onDelete: (id: number) => void;
  onEdit: (client: Client) => void;
}

type SortKey = keyof Client | null;
type SortDir = "asc" | "desc";

/**
 * Keep table concise.
 * This is an overview table, not a detail view.
 */
const COLUMNS: { key: keyof Client; label: string }[] = [
  { key: "file_no", label: "File No" },
  { key: "client_name", label: "Client Name" },
  { key: "client_group_name", label: "Group" },
  { key: "services_opted", label: "Services" },
  { key: "mobile_no", label: "Mobile" },
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

    if (typeof v1 === "number" && typeof v2 === "number") {
      return sortDir === "asc" ? v1 - v2 : v2 - v1;
    }

    return sortDir === "asc"
      ? String(v1).localeCompare(String(v2))
      : String(v2).localeCompare(String(v1));
  });

  /* ------------------------------- UI ------------------------------- */

  return (
    <div className="overflow-auto border rounded-lg shadow-sm">
      <table className="min-w-full text-sm border-collapse">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="border px-3 py-2 text-center w-12">#</th>

            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onDoubleClick={() => handleSort(col.key)}
                title="Double-click to sort"
                className="border px-3 py-2 cursor-default whitespace-nowrap hover:bg-gray-200 select-none"
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {sortKey === col.key && (
                    <span className="text-xs text-gray-600">
                      {sortDir === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
              </th>
            ))}

            <th className="border px-3 py-2 text-center whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedClients.map((c, i) => (
            <tr
              key={c.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="border px-3 py-2 text-center">
                {i + 1}
              </td>

              {COLUMNS.map((col) => (
                <td
                  key={col.key}
                  className="border px-3 py-2 whitespace-nowrap"
                >
                  {c[col.key] ?? "-"}
                </td>
              ))}

              <td className="border px-3 py-2 text-center whitespace-nowrap">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onEdit(c)}
                  className="text-blue-600 hover:underline mr-3"
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
                className="border px-4 py-8 text-center text-gray-500"
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
