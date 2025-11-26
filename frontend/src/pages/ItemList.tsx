// // src/pages/ItemsList.tsx
// import React, { useEffect, useState } from 'react';
// import { getItems } from '../services/api';

// type Item = {
//   id?: number | string;
//   title?: string;
//   price?: number;
//   image?: string;
//   status?: string;
//   category?: { id?: any; name?: string } | null;
//   createdAt?: string;
//   quantity?: number;
// };

// export default function ItemsList(): JSX.Element {
//   const [items, setItems] = useState<Item[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res: any = await getItems().catch(() => []);
//         // normalize common shapes: array | { content: [...] } | { data: [...] }
//         const raw = Array.isArray(res) ? res : res?.content || res?.data || [];
//         if (!mounted) return;
//         setItems(raw || []);
//       } catch (err: any) {
//         console.error('Failed to load items', err);
//         if (mounted) setError('Failed to load items');
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };
//     load();
//     return () => { mounted = false; };
//   }, []);

//   return (
//     <div>
//       <h2>Items</h2>
//       {loading && <div>Loading items…</div>}
//       {error && <div className="error">{error}</div>}

//       {!loading && items.length === 0 && <div>No items available.</div>}

//       {!loading && items.length > 0 && (
//         <table className="item-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
//           <thead>
//             <tr>
//               <th>ID</th><th>Title</th><th>Category</th><th>Price</th><th>Status</th><th>Qty</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map(it => (
//               <tr key={String(it.id)}>
//                 <td>{it.id}</td>
//                 <td>{it.title || '—'}</td>
//                 <td>{it.category?.name || '—'}</td>
//                 <td>{typeof it.price === 'number' ? `$${it.price.toFixed(2)}` : '—'}</td>
//                 <td>{it.status || 'PENDING'}</td>
//                 <td>{typeof it.quantity === 'number' ? it.quantity : '—'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }
