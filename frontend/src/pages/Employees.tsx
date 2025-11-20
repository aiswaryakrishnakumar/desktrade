// src/pages/Employees.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

type User = {
  id?: number | string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string;
  department?: string | null;
  role?: string | null;
  roles?: any;
  authorities?: any;
};

export default function Employees() {
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  function prettyName(u: User) {
    if (u.name) return u.name;
    return `${u.firstName || ''}${u.lastName ? ' ' + u.lastName : ''}`.trim() || '—';
  }

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

  return (
    <div>
      {/* Header */}
      <header className="admin-topbar" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="admin-title">Employees</h1>
          <p className="admin-sub">All registered employees.</p>
        </div>

        <div className="admin-controls">
          <Link to="/admin/employees/new" className="btn btn-primary">
            Add Employee
          </Link>
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
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 20, textAlign: 'center' }}>
                    No employees found.
                  </td>
                </tr>
              )}
              {list.map((u) => (
                <tr key={String(u.id || u.email)}>
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
