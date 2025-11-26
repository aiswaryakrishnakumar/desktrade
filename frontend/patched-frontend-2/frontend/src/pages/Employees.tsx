// src/pages/Employees.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

type User = {
  id?: number | string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  department?: string | null;
  role?: string | null;
  roles?: any;
  authorities?: any;
};

export default function Employees() {
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI states for header controls
  const [q, setQ] = useState('');
  const [onlyEmployees, setOnlyEmployees] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/employees?page=0&size=1000`, { headers });
        if (!res.ok) throw new Error(`status ${res.status}`);

        const data = await res.json().catch(() => null);
        const raw = Array.isArray(data) ? data : data?.content || data?.data || [];

        if (mounted) setList(raw);
      } catch (err: any) {
        console.error('Failed to load employees', err);
        if (mounted) setError('Failed to load employees');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Helper: create a pretty display name
  function prettyName(u: User) {
    if (u.name) return u.name;
    return `${u.firstName || ''}${u.lastName ? ' ' + u.lastName : ''}`.trim() || '—';
  }

  // Helper: normalize and display role(s)
  function prettyRole(u: User) {
    const raw = (
      u.role ||
      (u.roles && Array.isArray(u.roles) ? u.roles.join(', ') : '') ||
      (u.authorities && Array.isArray(u.authorities)
        ? u.authorities.map((a: any) => (a.authority || a.name || a)).join(', ')
        : '')
    ).toString();
    return raw.replace(/^ROLE_/, '') || '—';
  }

  // New helper: normalize role/roles/authorities into a single uppercased string for searching / filtering
  function normalizeRoleValue(val: any): string {
    if (!val && val !== 0) return '';
    // If it's a string
    if (typeof val === 'string') return val.toUpperCase();
    // If it's an array of strings or objects
    if (Array.isArray(val)) {
      return val
        .map((v) => {
          if (!v && v !== 0) return '';
          if (typeof v === 'string') return v;
          if (typeof v === 'object') return (v.authority || v.name || v.role || JSON.stringify(v));
          return String(v);
        })
        .join(', ')
        .toUpperCase();
    }
    // If it's an object (e.g., { authority: 'ROLE_EMPLOYEE' } or single role object)
    if (typeof val === 'object') {
      if ((val as any).authority) return String((val as any).authority).toUpperCase();
      if ((val as any).name) return String((val as any).name).toUpperCase();
      if ((val as any).role) return String((val as any).role).toUpperCase();
      return JSON.stringify(val).toUpperCase();
    }
    // Fallback
    return String(val).toUpperCase();
  }

  // Compute employee count from the full list (before filtering/search)
  const totalEmployeeCount = useMemo(() => {
    return list.filter(u => {
      const r = normalizeRoleValue(u.role || u.roles || u.authorities);
      return r.includes('EMPLOYEE');
    }).length;
  }, [list]);

  // Filter the visible list according to q and onlyEmployees
  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    return list.filter((u) => {
      // If onlyEmployees is checked, exclude non-employees
      if (onlyEmployees) {
        const r = normalizeRoleValue(u.role || u.roles || u.authorities);
        if (!r.includes('EMPLOYEE')) return false;
      }

      if (!query) return true;

      const name = prettyName(u).toLowerCase();
      const email = (u.email || '').toLowerCase();
      const dept = (u.department || '').toLowerCase();
      const roleString = normalizeRoleValue(u.role || u.roles || u.authorities).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        dept.includes(query) ||
        roleString.includes(query)
      );
    });
  }, [list, q, onlyEmployees]);

  return (
    <div>
      {/* Header (replaced with new header showing count, search and filter) */}
      <header className="admin-topbar" style={{ marginBottom: 18, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h1 className="admin-title">
            Employees{' '}
            <span style={{ color: '#6b7280', fontSize: 14, fontWeight: 400 }}>
              ({totalEmployeeCount})
            </span>
          </h1>
          <p className="admin-sub">All registered employees.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            className="search-input"
            placeholder="Search name, email or department..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ minWidth: 240 }}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={onlyEmployees} onChange={() => setOnlyEmployees(s => !s)} />
            <span style={{ fontSize: 14 }}>Employees only</span>
          </label>

          <Link to="/admin/employees/new" className="btn btn-primary">Add Employee</Link>
        </div>
      </header>

      {/* Table Panel */}
      <section className="panel" style={{ width: '100%' }}>
        {loading && <div style={{ padding: 16 }}>Loading…</div>}
        {error && <div className="error" style={{ padding: 16 }}>{error}</div>}

        <div style={{ overflowX: 'auto' }}>
          <table className="dt-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: 12 }}>Name</th>
                <th style={{ padding: 12 }}>Department</th>
                <th style={{ padding: 12 }}>Email</th>
                <th style={{ padding: 12 }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 20, textAlign: 'center' }}>
                    No employees found.
                  </td>
                </tr>
              )}
              {visible.map((u) => (
                <tr key={String(u.id ?? u.email ?? Math.random())}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{prettyName(u)}</td>
                  <td style={{ padding: 12 }}>{u.department || '—'}</td>
                  <td style={{ padding: 12 }}>{u.email || '—'}</td>
                  <td style={{ padding: 12 }}>{prettyRole(u)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
