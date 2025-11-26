// src/pages/CategoryView.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../App.css';
import { getCategoriesAdmin } from '../services/api'; // we'll fetch admin list and pick one if there's no single-get endpoint
// If your backend exposes GET /categories/{id}, replace getCategoriesAdmin usage with a single-category API.

type Category = { id?: any; name?: string; description?: string; status?: string; createdAt?: string; items?: any[] };

export default function CategoryView() {
  const { id } = useParams<{ id: string }>();
  const [cat, setCat] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Preferred: if backend supports GET /categories/{id} use it instead:
        // const res = await req(`/categories/${id}`, { method: 'GET' });
        // If not, we fetch admin list and find by id (works but less efficient)
        const res: any = await getCategoriesAdmin().catch(() => []);
        const raw = Array.isArray(res) ? res : res?.content || res?.data || [];
        const found = raw.find((c: any) => String(c.id) === String(id));
        if (mounted) setCat(found || null);
      } catch (err: any) {
        console.error('load category failed', err);
        if (mounted) setError('Failed to load category');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  if (!id) return <div className="panel">Invalid category id.</div>;

  return (
    <div>
      <header className="admin-topbar" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="admin-title">{cat?.name || 'Category'}</h1>
          <p className="admin-sub">{cat?.description || 'Category details'}</p>
        </div>
        <div className="admin-controls">
          <Link to="/admin/categories" className="btn btn-ghost">Back to categories</Link>
        </div>
      </header>

      <section className="panel">
        {loading && <div style={{ padding: 18 }}>Loading…</div>}
        {error && <div className="error" style={{ padding: 12 }}>{error}</div>}

        {!loading && !cat && <div style={{ padding: 20, color: '#6b7280' }}>Category not found.</div>}

        {!loading && cat && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <strong>Status:</strong> {cat.status || '—'}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Created:</strong> {cat.createdAt ? new Date(cat.createdAt).toLocaleString() : '—'}
            </div>

            <div style={{ marginTop: 18 }}>
              <h3 style={{ marginBottom: 8 }}>Items in this category</h3>
              {Array.isArray(cat.items) && cat.items.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
                  {cat.items.map((it: any) => (
                    <div className="item-card" key={String(it.id)}>
                      <div className="item-thumb" style={{ backgroundImage: `url(${it.image || '/assets/default.png'})` }} />
                      <div style={{ padding: 12 }}>
                        <div style={{ fontWeight: 700 }}>{it.title || `#${it.id}`}</div>
                        <div style={{ marginTop: 8, color: '#6b7280' }}>{it.seller?.name || it.sellerEmail || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 12, color: '#6b7280' }}>No items associated (or items not returned by API).</div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
