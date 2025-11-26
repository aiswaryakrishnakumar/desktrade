// src/App.tsx
import React, { type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";

import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

import NewCategory from "./pages/NewCategory";
import NewEmployee from "./pages/NewEmployee";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import AdminCategories from "./pages/AdminCategories";
// add this import at the top
import MyBookings from "./pages/admin/MyBookings";


import "./styles.css";

/* ============================================================
   AUTH HELPERS
=============================================================== */
const getToken = () => localStorage.getItem("token");
const getRole = () => localStorage.getItem("role"); // "admin" or "employee"

/* ============================================================
   PROTECTED ROUTE WRAPPER
=============================================================== */
const ProtectedRoute = ({
  children,
  allow
}: {
  children: JSX.Element;
  allow: string;
}) => {
  const token = getToken();
  const role = getRole();

  if (!token) return <Navigate to="/login" replace />;
  if (role !== allow) return <Navigate to="/login" replace />;

  return children;
};

/* ============================================================
   ADMIN NAV BAR
=============================================================== */
const AdminTopNav: React.FC = () => {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    nav("/login");
  };

  return (
    <header className="nav">
      <div className="nav-inner container-wide">
        <div className="brand">
          <div className="logo">DT</div>
          <div>
            <div className="title">DeskTrade</div>
            <div className="subtitle">Admin Console</div>
          </div>
        </div>

        <nav className="links">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/categories">Categories</Link>
          <Link to="/admin/employees">Employees</Link>
        </nav>

        <button className="btn-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

/* ============================================================
   LAYOUT WRAPPER (Common Layout)
=============================================================== */
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const onLoginPage = location.pathname === "/login";
  const role = getRole();

  return (
    <>
      <div className="aurora-bg" />
      
      {/* Admin navbar only for admin */}
      {!onLoginPage && role === "admin" && <AdminTopNav />}

      <main>{children}</main>
    </>
  );
};

/* ============================================================
   MAIN APP ROUTER
=============================================================== */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LayoutWrapper>
        <Routes>

          {/* DEFAULT → LOGIN */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* LOGIN PAGE */}
          <Route path="/login" element={<Login />} />

          {/* ====================== ADMIN ROUTES ====================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allow="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allow="admin">
                <AdminCategories />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categories/new"
            element={
              <ProtectedRoute allow="admin">
                <NewCategory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute allow="admin">
                <Employees />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/employees/new"
            element={
              <ProtectedRoute allow="admin">
                <NewEmployee />
              </ProtectedRoute>
            }
          />

          {/* ====================== EMPLOYEE ROUTES ====================== */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute allow="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* ====================== EMPLOYEE ROUTES ====================== */}
<Route
  path="/employee"
  element={
    <ProtectedRoute allow="employee">
      <EmployeeDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/employee/bookings"
  element={
    <ProtectedRoute allow="employee">
      <MyBookings />
    </ProtectedRoute>
  }
/>


          {/* 404 FALLBACK */}
          <Route path="*" element={<div style={{ padding: 20 }}>Page not found</div>} />

        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
};

export default App;
