import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import { isTokenExpired } from "./utils/auth";
import { logout } from "./utils/logout";
import Clients from "./pages/admin/Clients";
import GSTDashboard from "./pages/admin/GSTDashboard";
import IncomeTax from "./pages/admin/IncomeTax";
import TDS from "./pages/admin/TDS";
import Reports from "./pages/admin/Reports";

import type { JSX } from "react";

const ProtectedRoute = ({
  children,
  role,
}: {
  children: JSX.Element;
  role: "admin" | "employee";
}) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token || !userRole) {
    return <Navigate to="/" />;
  }

  if (isTokenExpired(token)) {
    logout();
    return null;
  }

  if (userRole !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute role="admin">
              <Clients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/gst"
          element={
            <ProtectedRoute role="admin">
              <GSTDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/income-tax"
          element={
            <ProtectedRoute role="admin">
              <IncomeTax />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tds"
          element={
            <ProtectedRoute role="admin">
              <TDS />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute role="admin">
              <Reports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
