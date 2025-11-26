// src/components/NewCategory.tsx
import React, { useState } from 'react';
import { apiPost } from '../services/api';

type Props = {
  onSuccess?: (created?: any) => void;
  onClose?: () => void;
  initialName?: string;
  initialDescription?: string;
};

const NewCategory: React.FC<Props> = ({ onSuccess, onClose, initialName = '', initialDescription = '' }) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e:React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null);
    if (!name.trim()) { setErr('Name required'); return; }
    setLoading(true);
    try {
      const res = await apiPost('/categories', { name: name.trim(), description: description.trim() });
      setMsg('Category created: ' + (res?.name || 'OK'));
      setName(''); setDescription('');
      // call parent callback
      onSuccess?.(res);
    } catch (e:any) {
      setErr(e?.message || (e?.data?.message) || 'Failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="card page" style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Create Category</h2>
        {onClose && (
          <button onClick={onClose} aria-label="Close" style={{
            border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer'
          }}>×</button>
        )}
      </div>

      <form onSubmit={submit} className="form" style={{ marginTop: 12 }}>
        <label>
          Name
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Stationery" />
        </label>

        <label>
          Description
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description" />
        </label>

        <div className="actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {onClose && (
            <button type="button" onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff' }}>
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} style={{ padding: '8px 12px', borderRadius: 8 }}>
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>

        {msg && <div className="success" style={{ marginTop: 10 }}>{msg}</div>}
        {err && <div className="error" style={{ marginTop: 10 }}>{err}</div>}
      </form>
    </div>
  );
};

export default NewCategory;
