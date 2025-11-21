// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import Employees from './pages/Employees';
import Employee from './pages/Employee';
import NewCategory from './pages/NewCategory';
import NewEmployee from './pages/NewEmployee';
import NewItem from './pages/NewItem';
import CategoriesPage from './pages/categories';       // CASE-SENSITIVE: file is Categories.tsx
import CategoryView from './pages/categoryview';      // CASE-SENSITIVE: file is CategoryView.tsx

// helper to parse JWT (same logic as your Login page)
function parseJwt(token: string | null) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch {
    return null;
  }
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function getRoleFromTokenOrUser() {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  if (userRaw) {
    try {
      const u = JSON.parse(userRaw);
      if (u?.role) return String(u.role).toLowerCase();
      if (u?.roles && Array.isArray(u.roles) && u.roles[0]) return String(u.roles[0]).toLowerCase();
    } catch {}
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
  return null;
}

type ProtectedProps = {
  children: React.ReactElement;
  require?: 'any' | 'admin' | 'employee';
};

function ProtectedRoute({ children, require = 'any' }: ProtectedProps) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  if (require === 'any') return children;
  const role = getRoleFromTokenOrUser() || '';
  if (require === 'admin' && role.includes('admin')) return children;
  if (require === 'employee' && (role.includes('employee') || role.includes('user'))) return children;
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Admin area (layout via Admin) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute require="admin">
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/new" element={<NewEmployee />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/new" element={<NewCategory />} />
          <Route path="categories/:id" element={<CategoryView />} />
        </Route>

        {/* Employee/Seller area */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute require="employee">
              <Employee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/items/new"
          element={
            <ProtectedRoute require="employee">
              <NewItem />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}
