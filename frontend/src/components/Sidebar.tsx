// // src/Sidebar.tsx
// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import '../App.css';
// import { getCategoriesAdmin } from '../services/api'; // path: src/services/api.ts

// export default function Sidebar({ active }: { active?: string }) {
//   const navigate = useNavigate();
//   const [categories, setCategories] = useState<any[]>([]);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res: any = await getCategoriesAdmin().catch(() => []);
//         // many APIs return { content: [...] } or an array
//         const raw = Array.isArray(res) ? res : res?.content || res?.data || [];
//         if (!mounted) return;
//         setCategories(raw || []);
//       } catch (err) {
//         console.error('Failed to load admin categories', err);
//       }
//     })();
//     return () => { mounted = false; };
//   }, []);

//   function logout() {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/');
//   }

//   return (
//     <aside className="dt-sidebar">
//       <div className="dt-brand">
//         <div className="dt-brand-icon">🏷️</div>
//         <div>
//           <div className="dt-brand-title">DeskTrade</div>
//           <div className="dt-brand-sub">Admin Panel</div>
//         </div>
//       </div>

//       <nav className="dt-nav">
//         <Link className={`dt-nav-item ${active === 'dashboard' ? 'active' : ''}`} to="/admin">Dashboard</Link>
//         <Link className={`dt-nav-item ${active === 'employees' ? 'active' : ''}`} to="/admin/employees">Employees</Link>
//         {/* <Link className={`dt-nav-item ${active === 'new-employee' ? 'active' : ''}`} to="/admin/employees/new">Add Employee</Link> */}
//         {/* <Link className={`dt-nav-item ${active === 'new-category' ? 'active' : ''}`} to="/admin/categories/new">New Category</Link> */}
//       </nav>

//       <div style={{ marginTop: 18, marginBottom: 8, fontSize: 13, color: '#374151' }}>
//         <strong style={{ display: 'block', marginBottom: 8 }}>Categories</strong>
//         <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 8 }}>
//           {categories.length === 0 && <div style={{ color: '#9ca3af' }}>No categories</div>}
//           {categories.slice(0, 5).map((c) => (
//             <div key={String(c.id)} style={{ padding: '6px 4px', borderRadius: 6 }}>
//               {/* navigate to category view page */}
//               <button
//                 onClick={() => navigate(`/admin/categories/${c.id}`)}
//                 className="btn"
//                 style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: 6 }}
//               >
//                 {c.name}
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* view all link */}
//         <div style={{ marginTop: 8 }}>
//           <Link to="/admin/categories" className="btn btn-ghost" style={{ fontSize: 13 }}>View all categories</Link>
//         </div>
//       </div>

//       <div style={{ marginTop: 'auto' }}>
//         <button onClick={logout} className="btn" style={{ width: '100%' }}>Log Out</button>
//       </div>
//     </aside>
//   );
// }























import React, { type JSX } from "react";
import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaBoxOpen, FaTags, FaShoppingCart } from "react-icons/fa";

export default function Sidebar(): JSX.Element {
  return (
    <div className="h-full flex flex-col justify-between p-6">
      <div>
        <div className="text-2xl font-bold text-primary mb-6">DeskTrade</div>
        <nav className="flex flex-col gap-2">
          <NavLink to="/admin" end className={({ isActive }) => `p-2 rounded ${isActive ? "bg-primary text-white" : "text-slate-700 hover:bg-gray-100"}`}>
            <div className="flex items-center gap-3"><FaTachometerAlt /> Dashboard</div>
          </NavLink>
          <NavLink to="/admin/employees" className={({ isActive }) => `p-2 rounded ${isActive ? "bg-primary text-white" : "text-slate-700 hover:bg-gray-100"}`}>
            <div className="flex items-center gap-3"><FaUsers /> Employees</div>
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => `p-2 rounded ${isActive ? "bg-primary text-white" : "text-slate-700 hover:bg-gray-100"}`}>
            <div className="flex items-center gap-3"><FaTags /> Categories</div>
          </NavLink>
          <NavLink to="/admin/items" className={({ isActive }) => `p-2 rounded ${isActive ? "bg-primary text-white" : "text-slate-700 hover:bg-gray-100"}`}>
            <div className="flex items-center gap-3"><FaBoxOpen /> Item Approvals</div>
          </NavLink>
          <NavLink to="/admin/purchases" className={({ isActive }) => `p-2 rounded ${isActive ? "bg-primary text-white" : "text-slate-700 hover:bg-gray-100"}`}>
            <div className="flex items-center gap-3"><FaShoppingCart /> Purchases</div>
          </NavLink>
        </nav>
      </div>

      <div className="text-sm text-gray-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div>
            <div className="font-medium">Admin</div>
            <div className="text-xs text-gray-400">Superuser</div>
          </div>
        </div>
      </div>
    </div>
  );
}
