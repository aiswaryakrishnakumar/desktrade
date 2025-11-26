// src/pages/AdminDashboard.tsx
import React, { useEffect, useState, type JSX } from 'react';
import {
  fetchAdminCategories,
  fetchPendingItems,
  fetchApprovedItemsByCategory,
  approveItemByAdmin,
  rejectItemByAdmin,
} from '../services/api';
import '../styles.css';

type Item = {
  id: number;
  title?: string;
  description?: string | null;
  price?: number;
  quantity?: number;
  status?: string;
  category?: { id?: number; name?: string } | null;
  seller?: { email?: string } | null;
  image?: string | null;
  createdAt?: string;
};

type Category = { id?: number; name?: string };

function normalizePageResponse<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.content && Array.isArray(res.content)) return res.content;
  return [];
}

export default function AdminDashboard(): JSX.Element {
  const [approvedItems, setApprovedItems] = useState<Item[]>([]);
  const [pendingItems, setPendingItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCats, setLoadingCats] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // load categories (public/admin)
  const loadCategories = async (): Promise<Category[]> => {
    setLoadingCats(true);
    try {
      const res = await fetchAdminCategories(); // /api/categories
      const cats = normalizePageResponse<Category>(res);
      setCategories(cats);
      return cats;
    } catch (e: any) {
      console.error('Failed to load categories', e);
      setError('Failed to load categories');
      return [];
    } finally {
      setLoadingCats(false);
    }
  };

  // pending items (admin)
  const loadPending = async () => {
    try {
      const res = await fetchPendingItems(0, 50); // /api/items/admin/pending?page=0&size=50
      const pend = normalizePageResponse<Item>(res);
      setPendingItems(pend);
    } catch (e: any) {
      console.error('Failed to load pending items', e);
      setPendingItems([]);
    }
  };

  // approved items per category
  const loadApprovedByCategories = async (cats: Category[]) => {
    try {
      let all: Item[] = [];
      for (const c of cats) {
        if (!c?.id) continue;
        try {
          const res = await fetchApprovedItemsByCategory(Number(c.id), 0, 50); // /api/items/by-category/{id}
          const items = normalizePageResponse<Item>(res);
          all = all.concat(items);
        } catch (inner: any) {
          console.warn(`Failed to load items for category ${c.id}`, inner);
        }
      }
      setApprovedItems(all);
    } catch (e: any) {
      console.error('Failed to load approved items', e);
      setApprovedItems([]);
    }
  };

  // top-level loader
  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await loadCategories();
      await Promise.all([loadPending(), loadApprovedByCategories(cats)]);
    } catch (e: any) {
      console.error('Dashboard load error', e);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // approve item
  const handleApprove = async (id: number) => {
    if (!confirm('Approve this item?')) return;
    try {
      await approveItemByAdmin(id);
      await loadAll();
    } catch (e: any) {
      console.error('Approve failed', e);
      alert(e?.data?.message ?? e?.message ?? 'Approve failed');
    }
  };

  // reject item (optionally pass reason)
  const handleReject = async (id: number) => {
    const reason = window.prompt('Reason for rejection (optional):', '');
    if (reason === null) return;
    try {
      await rejectItemByAdmin(id, reason || undefined);
      await loadAll();
    } catch (e: any) {
      console.error('Reject failed', e);
      alert(e?.data?.message ?? e?.message ?? 'Reject failed');
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading admin dashboard…</div>;

  const totalSales = approvedItems.reduce(
    (sum, it) => sum + (Number(it.price ?? 0) * Number(it.quantity ?? 0)),
    0
  );

  return (
    <div className="page">
      <h1>DeskTrade — Admin Console</h1>

      <div className="cards">
        <div className="stat-card">
          <h4>Pending Approval</h4>
          <div className="stat-value">{pendingItems.length}</div>
        </div>

        <div className="stat-card">
          <h4>Total Items</h4>
          <div className="stat-value">{approvedItems.length}</div>
        </div>

        <div className="stat-card">
          <h4>Total Sales</h4>
          <div className="stat-value">₹{totalSales}</div>
        </div>
      </div>

      <h2>Recent Items Pending</h2>
      {pendingItems.length === 0 ? (
        <p>No pending items.</p>
      ) : (
        pendingItems.map((it) => (
          <div className="item-row" key={it.id}>
            <div>
              <strong>{it.title ?? `#${it.id}`}</strong>
              <div className="muted">{it.description}</div>
              <div className="muted">Seller: {it.seller?.email ?? 'unknown'}</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="small" style={{ background: '#c8ffc8' }} onClick={() => handleApprove(it.id)}>Approve</button>
              <button className="small" style={{ background: '#ffe1e1' }} onClick={() => handleReject(it.id)}>Reject</button>
            </div>
          </div>
        ))
      )}

      <h2 style={{ marginTop: 36 }}>Approved Items</h2>
      {approvedItems.length === 0 ? (
        <p>No approved items yet.</p>
      ) : (
        <div className="cards" style={{ flexWrap: 'wrap' }}>
          {approvedItems.map((it) => (
            <div key={it.id} className="card" style={{ width: 260, padding: 18, borderRadius: 18 }}>
              <h3 style={{ marginBottom: 6 }}>{it.title}</h3>
              <div className="muted">{it.description}</div>
              <div style={{ marginTop: 10 }}>
                <strong>₹{it.price ?? 0}</strong>
                <div className="muted">Qty: {it.quantity ?? 0}</div>
                <div className="muted">Category: {it.category?.name ?? 'Unknown'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}
    </div>
  );
}
