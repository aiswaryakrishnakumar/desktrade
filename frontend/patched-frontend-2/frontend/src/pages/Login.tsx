// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // adjust if you put CSS elsewhere
import banner from '../assets/loginimage.png';

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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

  async function submit(e?: React.FormEvent) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { email: email.trim(), password };
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // robust error extraction
        let body: any = null;
        try {
          const ct = res.headers.get('content-type') || '';
          body = ct.includes('application/json') ? await res.json() : await res.text();
        } catch { body = await res.text().catch(() => null); }

        if (res.status === 401) setError('Invalid credentials. Please check email and password.');
        else if (res.status === 500) setError('Server error. Try again later.');
        else setError((body && (body.message || body.error)) || `Login failed (${res.status})`);
        setLoading(false);
        return;
      }

      const data = await res.json().catch(() => ({}));
      const token = data?.token || data?.accessToken || data?.jwt || data?.access_token || null;

      if (!token) {
        setError('Login succeeded but server did not return a token.');
        setLoading(false);
        return;
      }

      // store token + optionally user
      localStorage.setItem('token', token);
      if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));

      // derive role (same approach as earlier)
      let role: string | null = null;
      if (data?.user?.role) role = data.user.role;
      if (!role && data?.user?.roles) {
        const r = data.user.roles;
        role = Array.isArray(r) ? r[0] : r;
      }
      if (!role) {
        const claims = parseJwt(token);
        if (claims) {
          role = claims.role || claims.roles || claims.authorities || null;
          if (Array.isArray(role)) role = role[0];
          if (!role && claims.authorities && Array.isArray(claims.authorities)) {
            const first = claims.authorities[0];
            role = typeof first === 'string' ? first : first?.authority;
          }
        }
      }

      if (role) {
        const r = String(role).toLowerCase();
        if (r.includes('admin')) { navigate('/admin'); setLoading(false); return; }
        if (r.includes('employee') || r.includes('user')) { navigate('/employee'); setLoading(false); return; }
      }

      // default
      navigate('/employee');
    } catch (err) {
      console.error('Login failed', err);
      setError('Network error. Check backend and proxy configuration.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page center-screen">
      <div className="login-card" role="dialog" aria-labelledby="signin-title">
        <div className="left-panel">
          <div className="brand-row">
            <div className="brand-icon">🏷️</div>
            <div>
              <h3 className="brand-title">DeskTrade</h3>
              <p className="brand-sub">Your Internal Employee Marketplace.</p>
            </div>
          </div>
          <div className="illustration">
            <img src={banner} alt="Team at desk" className="illustration-img" />
          </div>
        </div>

        <div className="right-panel">
          <div>
            <h1 className="page-title" id="signin-title">Sign In</h1>
            <p className="sub">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={submit} className="login-form" aria-label="Login form">
            <label className="form-label">
              <div className="label-text">Email Address</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="form-input"
              />
            </label>

            <label className="form-label">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="label-text">Password</div>
                <button type="button" className="link-button" onClick={() => {/* placeholder */}}>Forgot Password?</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((s) => !s)}
                  className="eye-button"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </label>

            <div style={{ marginTop: 12 }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Signing in...' : 'Log In'}
              </button>
            </div>

            {error && <div className="error" role="alert" style={{ marginTop: 12 }}>{error}</div>}

            <p className="help" style={{ marginTop: 16 }}>
              Need help? <a href="#" onClick={(e) => e.preventDefault()}>Contact Support</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
