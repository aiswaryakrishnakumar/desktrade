// src/pages/Admin.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';   // adjust path if your Sidebar is located elsewhere
import '../App.css';

/**
 * Admin layout wrapper - single Sidebar + Outlet for nested pages
 */
export default function AdminLayout() {
  return (
    <div className="admin-root" aria-label="Admin layout">
      <Sidebar active="dashboard" />
      <main className="admin-main" role="main">
        <Outlet />
      </main>
    </div>
  );
}
