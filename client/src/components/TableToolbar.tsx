interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  filters: Record<string, string>;
  filterConfig: FilterConfig[];
  onFilterChange: (key: string, value: string) => void;
}

export default function TableToolbar({
  search,
  onSearchChange,
  filters,
  filterConfig,
  onFilterChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border px-3 py-2 rounded w-64"
      />

      {filterConfig.map((filter) => (
        <select
          key={filter.key}
          value={filters[filter.key] || ""}
          onChange={(e) =>
            onFilterChange(filter.key, e.target.value)
          }
          className="border px-3 py-2 rounded"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
