import { useEffect, useState } from "react";
import type { Client } from "../types/type";

interface Props {
  onClose: () => void;
  client?: Client;
}

type Option = {
  id?: number;
  label: string;
};

export default function ClientFormModal({ onClose, client }: Props) {
  const [form, setForm] = useState<Partial<Client>>({});
  const [admins, setAdmins] = useState<{ id: number; email: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: number; email: string }[]>(
    [],
  );
  const [clientGroups, setClientGroups] = useState<string[]>([]);

  /* ---------------------------- LOAD DATA ---------------------------- */

  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      fetch("http://localhost:5000/admin/admins", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch("http://localhost:5000/admin/employees", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch("http://localhost:5000/admin/client-groups", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ]).then(([admins, employees, groups]) => {
      setAdmins(admins);
      setEmployees(employees);
      setClientGroups(groups);
    });
  }, []);

  useEffect(() => {
    if (client) setForm(client);
  }, [client]);

  /* ----------------------------- SUBMIT ----------------------------- */

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      client
        ? `http://localhost:5000/admin/clients/${client.id}`
        : "http://localhost:5000/admin/clients",
      {
        method: client ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      },
    );

    if (!res.ok) {
      alert("Failed to save client");
      return;
    }

    onClose();
  };

  const hasGST =
    form.services_opted === "GST" || form.services_opted === "BOTH";
  const hasIT =
    form.services_opted === "INCOME_TAX" || form.services_opted === "BOTH";

  /* -------------------------------- UI -------------------------------- */

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="px-8 py-5 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">
              {client ? "Edit Client" : "Add New Client"}
            </h2>
            <p className="text-sm text-gray-500">
              Manage client identity, services, and assignments
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-6 space-y-10 overflow-y-auto">
          {/* CLIENT INFO */}
          <Section title="Client Information">
            <Field label="File Number">
              <input
                className="input"
                value={form.file_no || ""}
                onChange={(e) => setForm({ ...form, file_no: e.target.value })}
              />
            </Field>

            <Field label="Client Name">
              <input
                className="input"
                value={form.client_name || ""}
                onChange={(e) =>
                  setForm({ ...form, client_name: e.target.value })
                }
              />
            </Field>

            <Field label="Mobile Number">
              <input
                className="input"
                value={form.mobile_no || ""}
                onChange={(e) =>
                  setForm({ ...form, mobile_no: e.target.value })
                }
              />
            </Field>

            <Field label="Email Address">
              <input
                className="input"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>

            <Field label="Client Group" full>
              <SearchableSelect
                value={form.client_group_name}
                placeholder="Search or type new group"
                allowCustom
                options={clientGroups.map((g) => ({ label: g }))}
                onChange={(val) =>
                  setForm({ ...form, client_group_name: val })
                }
              />
            </Field>
          </Section>

          {/* INTERNAL ASSIGNMENT */}
          <Section title="Internal Assignment">
            <Field label="Admin Group (Owner)">
              <SearchableSelect
                value={
                  admins.find((a) => a.id === form.admin_group_id)?.email
                }
                placeholder="Search admin"
                options={admins.map((a) => ({
                  id: a.id,
                  label: a.email,
                }))}
                onChange={(val) => {
                  const admin = admins.find((a) => a.email === val);
                  if (admin)
                    setForm({ ...form, admin_group_id: admin.id });
                }}
              />
            </Field>

            <Field label="Assigned Employee">
              <SearchableSelect
                value={
                  employees.find(
                    (e) => e.id === form.assigned_employee_id,
                  )?.email
                }
                placeholder="Search employee"
                options={employees.map((e) => ({
                  id: e.id,
                  label: e.email,
                }))}
                onChange={(val) => {
                  const emp = employees.find((e) => e.email === val);
                  setForm({
                    ...form,
                    assigned_employee_id: emp?.id,
                  });
                }}
              />
            </Field>
          </Section>

          {/* SERVICES */}
          <Section title="Services Opted">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ServiceCard
                active={hasGST}
                title="GST Filing"
                desc="Monthly / Quarterly returns & compliance"
                onClick={() =>
                  setForm({
                    ...form,
                    services_opted: hasIT ? "BOTH" : "GST",
                  })
                }
              />
              <ServiceCard
                active={hasIT}
                title="Income Tax"
                desc="ITR, audit & advisory services"
                onClick={() =>
                  setForm({
                    ...form,
                    services_opted: hasGST ? "BOTH" : "INCOME_TAX",
                  })
                }
              />
            </div>
          </Section>

          {hasGST && (
            <Section title="GST Details">
              <Field label="GSTIN">
                <input
                  className="input"
                  value={form.gstin || ""}
                  onChange={(e) =>
                    setForm({ ...form, gstin: e.target.value })
                  }
                />
              </Field>

              <Field label="GST Filing Type">
                <input
                  className="input"
                  value={form.gst_filing_type || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gst_filing_type: e.target.value as any,
                    })
                  }
                />
              </Field>

              <Field label="GST User ID">
                <input
                  className="input"
                  value={form.gst_user_id || ""}
                  onChange={(e) =>
                    setForm({ ...form, gst_user_id: e.target.value })
                  }
                />
              </Field>

              <Field label="GST Password (info)">
                <input
                  className="input"
                  value={form.gst_password || ""}
                  onChange={(e) =>
                    setForm({ ...form, gst_password: e.target.value })
                  }
                />
              </Field>
            </Section>
          )}

          {hasIT && (
            <Section title="Income Tax Details">
              <Field label="ITR-V Status">
                <input
                  className="input"
                  value={form.itr_v_status || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      itr_v_status: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Audit Status">
                <input
                  className="input"
                  value={form.audit_status || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      audit_status: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="File Status">
                <input
                  className="input"
                  value={form.file_status || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      file_status: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Fees (₹)">
                <input
                  type="number"
                  className="input"
                  value={form.fees_amount || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fees_amount: Number(e.target.value),
                    })
                  }
                />
              </Field>
            </Section>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-8 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            Save Client
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- REUSABLE UI --------------------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function SearchableSelect({
  value,
  options,
  placeholder,
  onChange,
  allowCustom,
}: {
  value?: string;
  options: Option[];
  placeholder?: string;
  onChange: (val: string) => void;
  allowCustom?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="relative">
      <input
        className="input"
        placeholder={placeholder}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          if (allowCustom) onChange(e.target.value);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-48 overflow-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {allowCustom ? "Press Enter to add new" : "No results"}
            </div>
          ) : (
            filtered.map((o) => (
              <div
                key={o.id ?? o.label}
                onMouseDown={() => {
                  setQuery(o.label);
                  onChange(o.label);
                  setOpen(false);
                }}
                className="px-3 py-2 cursor-pointer text-sm hover:bg-blue-50"
              >
                {o.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ServiceCard({
  title,
  desc,
  active,
  onClick,
}: {
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-5 transition
        ${
          active
            ? "border-blue-600 bg-blue-50 shadow-sm"
            : "hover:border-gray-400"
        }`}
    >
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </div>
  );
}
