import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

type Item = {
  id: string;
  title: string;
  price?: number;
  listedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE';
  image?: string;
};

export default function Employee() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE'>('ALL');

  // dummy stats + items (replace with real fetch when ready)
  const stats = {
    totalListings: 28,
    activeListings: 15,
    itemsSold: 12,
    totalRevenue: 1450.0,
  };

  const items: Item[] = [
    { id: 'i1', title: 'Ergonomic Office Chair', price: 120, listedAt: '2023-08-12', status: 'APPROVED', image: '/assets/chair.jpg' },
    { id: 'i2', title: '13" Ultrabook Laptop', price: 450, listedAt: '2023-09-20', status: 'PENDING', image: '/assets/laptop.jpg' },
    { id: 'i3', title: 'Vintage Film Camera', price: 75, listedAt: '2023-07-05', status: 'REJECTED', image: '/assets/camera.jpg' },
  ];

  const filtered = useMemo(() => {
    if (filter === 'ALL') return items;
    return items.filter((it) => it.status === filter);
  }, [filter]);

  return (
    <div className="admin-root">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🏷️</div>
          <div className="brand-text">
            <div className="brand-title">DeskTrade</div>
            <div className="brand-sub">Seller Account</div>
          </div>
        </div>

        <nav className="nav">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Marketplace</button>
          <button className="nav-item">Messages</button>
          <button className="nav-item">My Account</button>
        </nav>

        <div style={{ marginTop: 'auto', padding: 16 }}>
          <button className="logout" onClick={() => navigate('/')}>Logout</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar" style={{ alignItems: 'center', gap: 16 }}>
          <div>
            <h1 className="page-title">Seller Dashboard</h1>
            <p className="sub">Manage your items and track your sales performance.</p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-approve" onClick={() => navigate('/items/new')}>Create New Item</button>
          </div>
        </header>

        <section className="cards" style={{ marginTop: 12 }}>
          <div className="stat-card">
            <div>
              <div className="stat-value">{stats.totalListings}</div>
              <div className="stat-title">Total Listings</div>
            </div>
            <div className="stat-trend teal">+5%</div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-value">{stats.activeListings}</div>
              <div className="stat-title">Active Listings</div>
            </div>
            <div className="stat-trend red">-2%</div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-value">{stats.itemsSold}</div>
              <div className="stat-title">Items Sold</div>
            </div>
            <div className="stat-trend green">+10%</div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-value">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="stat-title">Total Revenue</div>
            </div>
            <div className="stat-trend green">+12.5%</div>
          </div>
        </section>

        <section style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>My Items</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="tabs">
                <button className={`tab ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>All</button>
                <button className={`tab ${filter === 'PENDING' ? 'active' : ''}`} onClick={() => setFilter('PENDING')}>Pending</button>
                <button className={`tab ${filter === 'APPROVED' ? 'active' : ''}`} onClick={() => setFilter('APPROVED')}>Approved</button>
                <button className={`tab ${filter === 'REJECTED' ? 'active' : ''}`} onClick={() => setFilter('REJECTED')}>Rejected</button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginTop: 16 }}>
            {filtered.map((it) => (
              <div key={it.id} className="item-card">
                <div className="item-thumb" style={{
                  height: 120,
                  borderRadius: 8,
                  background: `url(${it.image || ''}) center/cover no-repeat`,
                  backgroundColor: '#f6f7fb'
                }} />
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>{it.title}</div>
                    <div className={`badge ${it.status === 'APPROVED' ? 'approved' : it.status === 'PENDING' ? 'pending' : 'rejected'}`} style={{ fontSize: 12 }}>
                      {it.status === 'APPROVED' ? 'Approved' : it.status === 'PENDING' ? 'Pending' : it.status === 'REJECTED' ? 'Rejected' : it.status}
                    </div>
                  </div>

                  <div style={{ color: '#0b74de', fontWeight: 700, marginTop: 8 }}>${it.price?.toFixed(2) ?? '—'}</div>
                  <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: 13 }}>
                    Listed: {new Date(it.listedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', padding: 28, border: '1px dashed #e6e9ef', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>No items listed yet</div>
                <div style={{ color: 'var(--muted)', marginBottom: 12 }}>Get started by listing your first item for sale.</div>
                <button className="btn btn-approve" onClick={() => navigate('/items/new')}>Create New Item</button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}