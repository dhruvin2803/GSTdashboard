import type { ReactNode } from "react";
import { logout } from "../utils/logout";

type AppLayoutProps = {
  title: string;
  children: ReactNode;
};

function AppLayout({ title, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
