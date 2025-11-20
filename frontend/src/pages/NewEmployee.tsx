import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { createEmployee } from '../services/api';

export default function NewEmployee() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Name, email and password are required');
      return;
    }
    setLoading(true);
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts.shift() || '';
    const lastName = parts.join(' ') || '';
    const sendRole = role === 'EMPLOYEE' ? 'ROLE_EMPLOYEE' : role === 'ADMIN' ? 'ROLE_ADMIN' : role;
    try {
      // send role as EMPLOYEE or ADMIN
      await createEmployee({ firstName, lastName, email: email.trim(), password, role: sendRole, department } as any);
      navigate('/admin/employees');
    } catch (err) {
      console.error(err);
      setError('Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-root">
      <main className="main-area">
        <header className="topbar">
          <h1 className="page-title">Add New Employee</h1>
        </header>

        <section style={{ maxWidth: 900, marginTop: 20 }}>
          <form className="panel" onSubmit={submit} style={{ padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <label>Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g., Jane Doe" />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Work Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@company.com" required />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Initial Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter an initial password" required />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Department</label>
                <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., Engineering" />
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-approve" disabled={loading}>{loading ? 'Adding…' : 'Add Employee'}</button>
              <button type="button" className="btn" onClick={() => navigate('/admin')}>Cancel</button>
            </div>

            {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
          </form>
        </section>
      </main>
    </div>
  );
}