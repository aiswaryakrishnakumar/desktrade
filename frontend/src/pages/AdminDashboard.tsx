// src/pages/AdminDashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { getItems, getCategoriesAdmin } from '../services/api';

type Item = {
  id?: any;
  title?: string;
  price?: number;
  image?: string;
  status?: string;
  category?: { id?: any; name?: string } | null;
  createdAt?: string;
};

export default function AdminDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<{ id: any; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // simple pager
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: any = await getItems().catch(() => []);
        // normalize many backends return { content: [...] } or array
        const raw = Array.isArray(res) ? res : res?.content || res?.data || [];
        if (!mounted) return;
        setItems(raw || []);
      } catch (err: any) {
        console.error('Failed to load items', err);
        if (mounted) setError('Failed to load items.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadCats = async () => {
      setLoadingCats(true);
      try {
        const res: any = await getCategoriesAdmin().catch(() => []);
        const raw = Array.isArray(res) ? res : res?.content || res?.data || [];
        if (mounted) setCategories(raw || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        if (mounted) setLoadingCats(false);
      }
    };
    loadCats();
    return () => { mounted = false; };
  }, []);

  // derived list: apply query + category filter + sort
  const filtered = useMemo(() => {
    let out = items.slice();

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(i =>
        String(i.title || '').toLowerCase().includes(q) ||
        String(i.category?.name || '').toLowerCase().includes(q)
      );
    }

    if (catFilter) {
      out = out.filter(i => String(i.category?.id) === String(catFilter));
    }

    if (sortBy === 'price-asc') out.sort((a,b) => (Number(a.price || 0) - Number(b.price || 0)));
    else if (sortBy === 'price-desc') out.sort((a,b) => (Number(b.price || 0) - Number(a.price || 0)));
    else out.sort((a,b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    return out;
  }, [items, query, catFilter, sortBy]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <header className="admin-topbar" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-sub">Overview — quick stats and recent listings.</p>
        </div>

        {/* Streamlined top controls: search + filters (NO large action buttons) */}
        <div className="admin-controls" style={{ alignItems: 'center' }}>
          <input
            aria-label="Search items"
            className="search-input"
            placeholder="Search items or categories..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            style={{ minWidth: 220 }}
          />

          <select
            className="search-input"
            value={catFilter || ''}
            onChange={(e) => { setCatFilter(e.target.value || null); setPage(1); }}
            style={{ minWidth: 160 }}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map(c => <option value={String(c.id)} key={String(c.id)}>{c.name}</option>)}
          </select>

          <select
            className="search-input"
            aria-label="Sort items"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ minWidth: 160 }}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </header>

      {/* small stats */}
      <section style={{ marginBottom: 18 }}>
        <div className="cards-grid">
          <div className="card">
            <div className="card-title">Items Pending</div>
            <div className="card-value">{items.filter(i => (i.status || '').toLowerCase() !== 'approved').length}</div>
            <div className="card-meta">Quick approval queue</div>
          </div>
          <div className="card">
            <div className="card-title">Total Listings</div>
            <div className="card-value">{items.length}</div>
            <div className="card-meta">Active & inactive</div>
          </div>
          <div className="card">
            <div className="card-title">Categories</div>
            <div className="card-value">{categories.length}</div>
            <div className="card-meta">{loadingCats ? 'loading…' : 'admin categories'}</div>
          </div>
          <div className="card">
            <div className="card-title">Sales Volume</div>
            <div className="card-value">$1,280</div>
            <div className="card-meta">Recent week</div>
          </div>
        </div>
      </section>

      {/* Items area */}
      <section className="panel">
        <div className="panel-header" style={{ marginBottom: 12 }}>
          <h2>Items</h2>
          <p style={{ margin: 0, color: '#6b7280' }}>Marketplace items — browse or select one to review details.</p>
        </div>

        <div style={{ marginTop: 12 }}>
          {loading && <div style={{ padding: 18 }}>Loading items…</div>}
          {error && <div className="error" style={{ padding: 12 }}>{error}</div>}

          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-illustration">🗂️</div>
              <div className="empty-title">No items found</div>
              <div className="empty-sub">Try clearing filters or add a new item to populate the marketplace.</div>
              <div style={{ marginTop: 12 }}>
                <Link to="/items/new" className="btn btn-primary">Create an item</Link>
                <Link to="/admin/categories/new" className="btn btn-ghost" style={{ marginLeft: 8 }}>Create category</Link>
              </div>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <div className="items-grid">
                {pageItems.map(it => (
                  <article
                    key={String(it.id)}
                    className="item-card"
                    onClick={() => window.location.assign(`/admin/items/${it.id}`)} /* navigate - replace with react-router navigate if you prefer */
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') window.location.assign(`/admin/items/${it.id}`); }}
                  >
                    <div className="item-thumb" style={{ backgroundImage: `url(${it.image || '/assets/default.png'})` }} />
                    <div className="item-body">
                      <div className="item-title">{it.title || `#${it.id}`}</div>
                      <div className="item-meta">{it.category?.name || 'Uncategorized'}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <div style={{ fontWeight: 700 }}>{typeof it.price === 'number' ? `$${it.price.toFixed(2)}` : '—'}</div>
                        <div className={`status-pill ${String(it.status || '').toLowerCase()}`}>{it.status || 'PENDING'}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* pager */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <div style={{ color: '#6b7280' }}>
                  Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
                  <div style={{ alignSelf: 'center' }}>{page} / {totalPages}</div>
                  <button className="btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
