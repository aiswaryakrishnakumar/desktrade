// src/pages/Categories.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { getCategoriesAdmin, approveCategory, rejectCategory } from '../services/api';

type Category = { id?: any; name?: string; description?: string; status?: string; createdAt?: string };

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await getCategoriesAdmin();
      setCats(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onApprove = async (id: any) => {
    setBusyId(id);
    try {
      await approveCategory(id);
      // refresh
      await load();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Approve failed');
    } finally { setBusyId(null); }
  };

  const onReject = async (id: any) => {
    // optional: ask for reason / confirmation - simplified here
    if (!confirm('Reject this category?')) return;
    setBusyId(id);
    try {
      await rejectCategory(id);
      await load();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Reject failed');
    } finally { setBusyId(null); }
  };

  return (
    <div>
      <header className="admin-topbar" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="admin-title">Categories</h1>
          <p className="admin-sub">Manage categories in the marketplace.</p>
        </div>
        <div className="admin-controls">
          <Link to="/admin/categories/new" className="btn btn-primary">Create New Category</Link>
        </div>
      </header>

      <section className="panel">
        {loading && <div style={{ padding: 18 }}>Loading categories…</div>}
        {error && <div className="error" style={{ padding: 12 }}>{error}</div>}

        {!loading && cats.length === 0 && <div style={{ padding: 20, color: '#6b7280' }}>No categories found.</div>}

        {!loading && cats.length > 0 && (
          <div className="table-wrap">
            <table className="dt-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cats.map(c => (
                  <tr key={String(c.id)}>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td>{c.description || '—'}</td>
                    <td>{String(c.status || '—').toUpperCase()}</td>
                    <td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/categories/${c.id}`} className="btn" style={{ marginRight: 8 }}>View</Link>

                      {/* Show approve/reject only for PENDING */}
                      {String((c.status || '').toLowerCase()) === 'pending' && (
                        <>
                          <button className="btn btn-primary" disabled={busyId === c.id} onClick={() => onApprove(c.id)}>
                            {busyId === c.id ? '...' : 'Approve'}
                          </button>
                          <button className="btn btn-ghost" disabled={busyId === c.id} onClick={() => onReject(c.id)} style={{ marginLeft: 8 }}>
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
