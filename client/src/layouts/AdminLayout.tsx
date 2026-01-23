import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { logout } from "../utils/logout";

type AdminLayoutProps = {
  title: string;
  children: ReactNode;
};

function AdminLayout({ title, children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Admin Panel
          </h2>
        </div>

        <nav className="px-4 py-4 space-y-1 text-sm">
          <SidebarLink to="/admin" label="Dashboard" />
          <SidebarLink to="/admin/clients" label="Clients" />
          <SidebarLink to="/admin/gst" label="GST Dashboard" />
          <SidebarLink to="/admin/income-tax" label="Income Tax" />
          <SidebarLink to="/admin/tds" label="TDS" />
          <SidebarLink to="/admin/reports" label="Reports" />
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-800">
              {title}
            </h1>

            <button
              onClick={logout}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

/* ---------------- Sidebar Link Component ---------------- */

function SidebarLink({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `block rounded px-3 py-2 ${
          isActive
            ? "bg-blue-50 text-blue-700 font-medium"
            : "text-slate-700 hover:bg-slate-100"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
