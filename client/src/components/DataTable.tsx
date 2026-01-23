type Column<T> = {
  key: keyof T;
  label: string;
  monospace?: boolean;
};

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
}

export default function DataTable<T extends { id: number }>({
  data,
  columns,
}: DataTableProps<T>) {
  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm border-collapse select-text">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">Sr No</th>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="border px-3 py-2 text-left font-medium"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{index + 1}</td>
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`border px-3 py-2 ${
                    col.monospace ? "font-mono" : ""
                  }`}
                >
                  {String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
