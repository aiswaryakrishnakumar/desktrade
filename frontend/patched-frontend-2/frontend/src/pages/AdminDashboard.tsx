// src/pages/AdminDashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { getItems, getCategoriesAdmin, approveItem, rejectItem } from '../services/api';
import NewItem from './NewItem';

type Item = {
  id?: any;
  title?: string;
  price?: number;
  image?: string;
  status?: string;
  category?: { id?: any; name?: string } | null;
  createdAt?: string;
  quantity?: number;
};

function getAuthHeaders() {
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export default function AdminDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<{ id: any; name?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const [showNewItemForm, setShowNewItemForm] = useState(false);
  // track action loading per item id
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // image preview modal
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: any = await getItems().catch(() => []);
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

  // Filtering / sorting
  const filtered = useMemo(() => {
    let out = items.slice();
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(i =>
        String(i.title || '').toLowerCase().includes(q) ||
        String(i.category?.name || '').toLowerCase().includes(q)
      );
    }
    if (catFilter) out = out.filter(i => String(i.category?.id) === String(catFilter));
    if (sortBy === 'price-asc') out.sort((a,b) => (Number(a.price || 0) - Number(b.price || 0)));
    else if (sortBy === 'price-desc') out.sort((a,b) => (Number(b.price || 0) - Number(a.price || 0)));
    else out.sort((a,b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return out;
  }, [items, query, catFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Helper to set action loading state
  const setItemActionLoading = (id: any, v: boolean) => {
    setActionLoading(prev => ({ ...prev, [String(id)]: v }));
  };

  // Approve handler
  const handleApprove = async (itemId: any) => {
    if (!confirm('Approve this item?')) return;
    setItemActionLoading(itemId, true);
    try {
      await approveItem(itemId);
      // update local state: mark approved
      setItems(prev => prev.map(it => it.id === itemId ? { ...it, status: 'APPROVED' } : it));
    } catch (err: any) {
      console.error('Approve failed', err);
      alert(err?.body?.message || err?.message || 'Approve failed');
    } finally {
      setItemActionLoading(itemId, false);
    }
  };

  // Reject handler (asks for reason)
  const handleReject = async (itemId: any) => {
    const reason = window.prompt('Reason for rejection (optional):', '');
    if (reason === null) return; // cancelled
    setItemActionLoading(itemId, true);
    try {
      await rejectItem(itemId, reason ? { reason } : {});
      // mark rejected locally or remove from list:
      setItems(prev => prev.filter(it => it.id !== itemId));
    } catch (err: any) {
      console.error('Reject failed', err);
      alert(err?.body?.message || err?.message || 'Reject failed');
    } finally {
      setItemActionLoading(itemId, false);
    }
  };

  // Book handler (front-end placeholder)
  const handleBook = async (itemId: any) => {
    const qtyStr = window.prompt('Enter quantity to book (leave empty for 1):', '1');
    if (qtyStr === null) return; // cancelled
    const qty = qtyStr.trim() === '' ? 1 : Number(qtyStr);
    if (Number.isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    setItemActionLoading(itemId, true);
    try {
      setItems(prev => prev.map(it => it.id === itemId ? { ...it, status: 'BOOKED', quantity: (it.quantity ?? 0) - qty } : it));
      alert(`Booked ${qty} unit(s) for item #${itemId}. (UI updated locally)`);
    } catch (err: any) {
      console.error('Booking failed', err);
      alert(err?.message || 'Booking failed');
    } finally {
      setItemActionLoading(itemId, false);
    }
  };

  return (
    <div>
      <header className="admin-topbar" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-sub">Overview — quick stats and recent listings.</p>
        </div>

        <div className="admin-controls" style={{ alignItems: 'center' }}>
          <input
            aria-label="Search items"
            className="search-input"
            placeholder="Search items or categories..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            style={{ minWidth: 220 }}
          />

          {/* Fancy category dropdown: show names with simple styling */}
          <select
            className="search-input"
            value={catFilter || ''}
            onChange={(e) => { setCatFilter(e.target.value || null); setPage(1); }}
            style={{ minWidth: 220 }}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map(c => <option value={String(c.id)} key={String(c.id)}>{c.name || `#${c.id}`}</option>)}
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

          {/* Add Item button (navigates to full /items/new page) */}
          <Link to="/items/new" className="btn btn-primary" style={{ marginLeft: 12 }}>
            + Add Item
          </Link>
        </div>
      </header>

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

      <section className="panel">
        <div className="panel-header" style={{ marginBottom: 12 }}>
          <h2>Items</h2>
          <p style={{ margin: 0, color: '#6b7280' }}>Marketplace items — browse or select one to review details.</p>
        </div>

        <div style={{ marginTop: 12 }}>
          {loading && <div style={{ padding: 18 }}>Loading items…</div>}
          {error && <div className="error" style={{ padding: 12 }}>{error}</div>}

          {!loading && filtered.length === 0 && !showNewItemForm && (
            <div className="empty-state">
              <div className="empty-illustration">🗂️</div>
              <div className="empty-title">No items found</div>
              <div className="empty-sub">Try clearing filters or add a new item to populate the marketplace.</div>
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={() => setShowNewItemForm(true)}>Create an item</button>
              </div>
            </div>
          )}

          {showNewItemForm && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Create new item</h3>
                <div>
                  <button className="btn" onClick={() => setShowNewItemForm(false)}>Close</button>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <NewItem onSuccess={(created) => {
                  // do not navigate away — just update dashboard items
                  setShowNewItemForm(false);
                  if (created) setItems(prev => [created, ...prev]);
                }} />
              </div>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <div className="items-grid">
                {pageItems.map(it => {
                  const lowerStatus = String(it.status || '').toLowerCase();
                  const isApproved = lowerStatus === 'approved';
                  return (
                    <article
                      key={String(it.id)}
                      className="item-card"
                      role="button"
                      tabIndex={0}
                    >
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div
                          className="item-thumb"
                          style={{
                            backgroundImage: `url(${it.image || '/assets/default.png'})`,
                            minWidth: 120,
                            minHeight: 80,
                            cursor: it.image ? 'pointer' : 'default',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                          onClick={() => it.image && setPreviewUrl(it.image)}
                          title={it.image ? 'Click to preview' : undefined}
                        />
                        <div style={{ flex: 1 }}>
                          <div className="item-title">{it.title || `#${it.id}`}</div>
                          <div className="item-meta" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span>{it.category?.name || 'Uncategorized'}</span>
                            {typeof it.quantity === 'number' && <span style={{ color: '#6b7280' }}>• {it.quantity} in stock</span>}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <div style={{ fontWeight: 700 }}>{typeof it.price === 'number' ? `$${it.price.toFixed(2)}` : '—'}</div>
                            <div className={`status-pill ${lowerStatus}`}>{it.status || 'PENDING'}</div>
                          </div>

                          {/* Action buttons */}
                          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                            {!isApproved && (
                              <>
                                <button
                                  className="btn btn-success"
                                  disabled={!!actionLoading[String(it.id)]}
                                  onClick={() => handleApprove(it.id)}
                                >
                                  {actionLoading[String(it.id)] ? 'Working…' : 'Approve'}
                                </button>

                                <button
                                  className="btn btn-ghost"
                                  disabled={!!actionLoading[String(it.id)]}
                                  onClick={() => handleReject(it.id)}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            <button
                              className="btn btn-primary"
                              disabled={!!actionLoading[String(it.id)]}
                              onClick={() => handleBook(it.id)}
                            >
                              Book Item
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

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

      {/* Image preview modal */}
      {previewUrl && (
        <div className="modal-backdrop" onClick={() => setPreviewUrl(null)} style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)'
        }}>
          <div style={{ background: '#fff', padding: 12, borderRadius: 8, maxWidth: '90%', maxHeight: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <img src={previewUrl} alt="preview" style={{ maxWidth: '90vw', maxHeight: '80vh', display: 'block' }} />
          </div>
        </div>
      )}
    </div>
  );
}
