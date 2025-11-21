// src/App.tsx
import type { ReactElement } from 'react';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages / Layouts
import Login from './pages/Login';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import Employees from './pages/Employees';
import NewCategory from './pages/NewCategory';
import NewEmployee from './pages/NewEmployee';
import NewItem from './pages/NewItem';
import EmployeeDashboard from './pages/EmployeeDashboard';

// NOTE: ensure these imports match the exact file names (case-sensitive on some OS)
import CategoriesPage from './pages/categories';
import CategoryView from './pages/categoryview';

/* ------------------ auth helpers ------------------ */

function parseJwt(token: string | null) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    // base64 decode safely
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function getRoleFromTokenOrUser(): string {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  if (userRaw) {
    try {
      const u = JSON.parse(userRaw);
      if (u?.role) return String(u.role).toLowerCase();
      if (u?.roles && Array.isArray(u.roles) && u.roles[0]) return String(u.roles[0]).toLowerCase();
    } catch {
      // fallthrough to token parsing
    }
  }

  const token = getToken();
  const claims: any = parseJwt(token);
  if (claims) {
    if (claims.role) return String(claims.role).toLowerCase();
    if (claims.roles && Array.isArray(claims.roles) && claims.roles[0]) return String(claims.roles[0]).toLowerCase();
    if (claims.authorities && Array.isArray(claims.authorities) && claims.authorities[0]) {
      const first = claims.authorities[0];
      return (typeof first === 'string' ? first : first?.authority || '').toLowerCase();
    }
  }

  return '';
}

/* ------------------ ProtectedRoute ------------------ */
/* Usage: <ProtectedRoute require="admin"><AdminLayout /></ProtectedRoute>
   - require: 'any' (authenticated), 'admin', 'employee'
*/
type ProtectedProps = {
  children: ReactElement;
  require?: 'any' | 'admin' | 'employee';
};

function ProtectedRoute({ children, require = 'any' }: ProtectedProps) {
  const token = getToken();
  if (!token) {
    // not authenticated
    return <Navigate to="/" replace />;
  }

  if (require === 'any') return children;

  const role = getRoleFromTokenOrUser() || '';
  if (require === 'admin' && role.includes('admin')) return children;
  if (require === 'employee' && (role.includes('employee') || role.includes('user'))) return children;

  // authenticated but not authorized
  return <Navigate to="/" replace />;
}

/* ------------------ App (routes) ------------------ */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Admin area (Admin acts as a layout for nested admin pages) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute require="admin">
              <Admin />
            </ProtectedRoute>
          }
        >
          {/* index -> /admin */}
          <Route index element={<AdminDashboard />} />

          {/* child routes are RELATIVE (no leading slash) */}
          <Route path="employees" element={<Employees />} />
          <Route path="employees/new" element={<NewEmployee />} />

          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/new" element={<NewCategory />} />
          <Route path="categories/:id" element={<CategoryView />} />

          {/* admin adding item -> /admin/items/new */}
          <Route path="items/new" element={<NewItem />} />
        </Route>

        {/* Employee area (top-level route) */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute require="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback - unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
