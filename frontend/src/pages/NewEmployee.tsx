// src/pages/NewEmployee.tsx (or .jsx)
/* Updated: normalize role to DB-friendly value before sending (strip "ROLE_" prefix) */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../services/api';

const ROLE_OPTIONS = [
  { value: 'ROLE_EMPLOYEE', label: 'Employee' },
  { value: 'ROLE_ADMIN', label: 'Admin' },
];

const NewEmployee: React.FC = () => {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLE_OPTIONS[0].value);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function normalizeRole(r: string) {
    // remove leading ROLE_ prefix if present, and ensure uppercase canonical form
    if (!r) return r;
    return r.replace(/^ROLE_/i, '').toUpperCase();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    const tName = name.trim();
    const tEmail = email.trim();
    if (!tName || !tEmail || !password) {
      setErr('Please fill name, email and password');
      return;
    }

    // small client-side email sanity check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tEmail)) {
      setErr('Please enter a valid email address');
      return;
    }

    setBusy(true);
    try {
      const body = {
        name: tName,
        email: tEmail,
        department: department.trim() || null,
        password,
        // normalize to value DB likely expects: "ADMIN" / "EMPLOYEE"
        role: normalizeRole(role),
      };

      // This endpoint may require auth; ensure the currently logged-in user has permission
      const res = await apiPost('/auth/register', body);
      setMsg('Employee created: ' + (res?.name ?? res?.email ?? 'OK'));
      // optionally navigate back to employees list after short delay
      setTimeout(() => nav('/employees'), 900);
    } catch (e: any) {
      console.error(e);
      // try to extract friendly message from backend response
      const backendMsg = e?.response?.data?.message ?? e?.message ?? null;
      setErr(backendMsg || 'Failed to create employee');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page container">
      <div className="card" style={{ maxWidth: 720, margin: '16px auto' }}>
        <h2>Create Employee</h2>
        <form className="form" onSubmit={submit}>
          <label>
            Name
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
          </label>

          <label>
            Email
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
          </label>

          <label>
            Department
            <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Sales" />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Strong password"
            />
          </label>

          <label>
            Role
            <select value={role} onChange={e => setRole(e.target.value)}>
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>

          <div className="actions">
            <button type="submit" disabled={busy}>{busy ? 'Creating...' : 'Create Employee'}</button>
          </div>

          {msg && <div className="success" role="status" style={{ marginTop: 8 }}>{msg}</div>}
          {err && <div className="error" role="alert" style={{ marginTop: 8 }}>{err}</div>}
        </form>
      </div>
    </div>
  );
};

export default NewEmployee;
