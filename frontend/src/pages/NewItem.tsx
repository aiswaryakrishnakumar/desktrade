import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

type Category = { id?: number | string; name?: string };

export default function NewItem() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userRaw ? JSON.parse(userRaw) : null;
  const sellerEmail = user?.email || '';

  function authHeaders() {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/categories?page=0&size=1000`, { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        const raw = Array.isArray(data) ? data : data?.content || data?.data || [];
        if (mounted) setCategories(raw);
      } catch (err) {
        console.error('load categories failed', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!title.trim()) { setError('Title is required'); return; }
    if (!price || Number(price) <= 0) { setError('Price must be greater than 0'); return; }

    const payload: any = {
      title: title.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      quantity: Number(quantity) || 1,
    };
    if (categoryId) payload.categoryId = Number(categoryId);

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => res.statusText || 'request failed');
        throw new Error(`Create item failed: ${res.status} ${txt}`);
      }
      // success
      navigate('/employee');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-root">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">📦</div>
          <div className="brand-text">
            <div className="brand-title">DeskTrade</div>
            <div className="brand-sub">Create Item</div>
          </div>
        </div>

        <nav className="nav">
          <button className="nav-item" onClick={() => navigate('/employee')}>Dashboard</button>
          <button className="nav-item" onClick={() => navigate('/admin')}>Admin</button>
        </nav>

        <div style={{ marginTop: 'auto', padding: 16 }}>
          <button className="logout" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }}>Logout</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <h1 className="page-title">Create New Item</h1>
        </header>

        <section style={{ padding: 20 }}>
          <div className="panel" style={{ maxWidth: 900, margin: '0 auto' }}>
            <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
              <div>
                <label>Item Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a descriptive title" />
              </div>

              <div>
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Provide details about the item's condition, features, etc." />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label>Price</label>
                  <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                </div>

                <div style={{ width: 160 }}>
                  <label>Available Quantity</label>
                  <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value || 1))} />
                </div>
              </div>

              <div>
                <label>Category</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Choose category</option>
                  {categories.map((c) => <option key={String(c.id)} value={String(c.id)}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label>Seller Email (auto)</label>
                <input value={sellerEmail} disabled placeholder="seller.email@company.com" />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-approve" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Item'}</button>
                <button type="button" className="btn" onClick={() => navigate('/employee')}>Cancel</button>
              </div>

              {error && <div className="error">{error}</div>}
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}