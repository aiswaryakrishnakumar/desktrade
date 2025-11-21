// // src/pages/EmployeeDashboard.tsx
// import { useEffect, useMemo, useState, type JSX } from 'react';
// import { Link } from 'react-router-dom';
// import { getEmployees } from '../services/api';

// type Employee = {
//   id?: string | number;
//   name?: string;
//   email?: string;
//   role?: string;
//   status?: string;
//   department?: string;
//   createdAt?: string;
// };

// export default function EmployeeDashboard(): JSX.Element {
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // UI
//   const [query, setQuery] = useState('');
//   const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all');
//   const [sortBy, setSortBy] = useState<'newest' | 'name-asc' | 'name-desc'>('newest');

//   // pagination
//   const [page, setPage] = useState(1);
//   const PAGE_SIZE = 8;

//   // load employees (normalizes common shapes)
//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res: any = await getEmployees().catch(() => []);
//         const raw = Array.isArray(res) ? res : res?.content || res?.data || res;
//         if (!mounted) return;
//         setEmployees(raw || []);
//       } catch (err: any) {
//         console.error('Failed to load employees', err);
//         if (mounted) setError('Failed to load employees');
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };
//     load();
//     return () => { mounted = false; };
//   }, []);

//   const filtered = useMemo(() => {
//     let out = employees.slice();
//     if (query.trim()) {
//       const q = query.trim().toLowerCase();
//       out = out.filter(e =>
//         String(e.name || '').toLowerCase().includes(q) ||
//         String(e.email || '').toLowerCase().includes(q) ||
//         String(e.department || '').toLowerCase().includes(q)
//       );
//     }
//     if (tab === 'active') out = out.filter(e => (String(e.status || '').toLowerCase() === 'active' || String(e.status || '').toLowerCase() === 'enabled'));
//     if (tab === 'inactive') out = out.filter(e => (String(e.status || '').toLowerCase() === 'inactive' || String(e.status || '').toLowerCase() === 'disabled' || !e.status));
//     if (sortBy === 'name-asc') out.sort((a,b) => String(a.name || '').localeCompare(String(b.name || '')));
//     else if (sortBy === 'name-desc') out.sort((a,b) => String(b.name || '').localeCompare(String(a.name || '')));
//     else out.sort((a,b) => {
//       const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
//       const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
//       return tb - ta;
//     });
//     return out;
//   }, [employees, query, tab, sortBy]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);
//   const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   return (
//     <div className="min-h-screen bg-slate-50 p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="flex items-start justify-between mb-6 gap-4">
//           <div>
//             <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
//             <p className="text-sm text-slate-500 mt-1">Manage employees, roles and status.</p>
//           </div>

//           <div className="flex items-center gap-3">
//             <input
//               aria-label="Search employees"
//               placeholder="Search by name, email or department..."
//               value={query}
//               onChange={(e) => { setQuery(e.target.value); setPage(1); }}
//               className="px-3 py-2 rounded-md border bg-white shadow-sm text-sm w-80"
//             />

//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value as any)}
//               className="px-3 py-2 rounded-md border bg-white text-sm"
//             >
//               <option value="newest">Newest</option>
//               <option value="name-asc">Name: A → Z</option>
//               <option value="name-desc">Name: Z → A</option>
//             </select>

//             <Link to="/employees/new" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm">
//               + Add Employee
//             </Link>
//           </div>
//         </div>

//         {/* stats + tabs */}
//         <div className="grid grid-cols-4 gap-4 mb-6">
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-sm text-slate-500">Total Employees</div>
//             <div className="text-2xl font-semibold">{employees.length}</div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-sm text-slate-500">Active</div>
//             <div className="text-2xl font-semibold">{employees.filter(e => String(e.status || '').toLowerCase() === 'active').length}</div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-sm text-slate-500">Inactive</div>
//             <div className="text-2xl font-semibold">{employees.filter(e => String(e.status || '').toLowerCase() !== 'active').length}</div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <div className="text-sm text-slate-500">Departments</div>
//             <div className="text-2xl font-semibold">{Array.from(new Set(employees.map(e => e.department || 'Unassigned'))).length}</div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-2">
//             {(['all','active','inactive'] as const).map(t => (
//               <button
//                 key={t}
//                 onClick={() => { setTab(t); setPage(1); }}
//                 className={`px-3 py-2 rounded-full text-sm ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white shadow-sm text-slate-700'}`}
//               >
//                 {t[0].toUpperCase() + t.slice(1)}
//               </button>
//             ))}
//           </div>

//           <div className="text-sm text-slate-500">Showing {(page-1)*PAGE_SIZE + 1} - {Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</div>
//         </div>

//         {/* Content */}
//         <section>
//           {loading && (
//             <div className="grid grid-cols-3 gap-6">
//               {Array.from({ length: 3 }).map((_, i) => (
//                 <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
//                   <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
//                   <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
//                   <div className="h-4 bg-slate-200 rounded w-2/3" />
//                 </div>
//               ))}
//             </div>
//           )}

//           {error && <div className="p-4 bg-red-50 text-red-700 rounded mb-4">{error}</div>}

//           {!loading && filtered.length === 0 && (
//             <div className="p-8 bg-white rounded shadow text-center">No employees found — try clearing filters or add a new employee.</div>
//           )}

//           {!loading && filtered.length > 0 && (
//             <>
//               <div className="grid grid-cols-3 gap-6">
//                 {pageItems.map(emp => (
//                   <div key={String(emp.id)} className="bg-white rounded-lg shadow p-4 flex flex-col">
//                     <div className="flex items-start justify-between gap-4">
//                       <div>
//                         <div className="text-lg font-semibold">{emp.name || `#${emp.id}`}</div>
//                         <div className="text-sm text-slate-500">{emp.email}</div>
//                         <div className="text-sm text-slate-500 mt-2">{emp.department || 'Unassigned'}</div>
//                       </div>

//                       <div className="text-right">
//                         <div className={`px-2 py-1 rounded-full text-xs ${String(emp.status || '').toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
//                           {emp.status || 'Inactive'}
//                         </div>
//                         <div className="text-sm text-slate-400 mt-2">{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '—'}</div>
//                       </div>
//                     </div>

//                     <div className="mt-4 flex gap-2">
//                       <Link to={`/employees/${emp.id}`} className="px-3 py-2 border rounded text-sm">View</Link>
//                       <Link to={`/employees/${emp.id}/edit`} className="px-3 py-2 border rounded text-sm">Edit</Link>
//                       <button className="ml-auto px-3 py-2 bg-indigo-600 text-white rounded text-sm">Message</button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* pagination */}
//               <div className="mt-6 flex items-center justify-between">
//                 <div className="text-sm text-slate-500">Page {page} of {totalPages}</div>
//                 <div className="flex items-center gap-2">
//                   <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
//                   <div className="px-3">{page} / {totalPages}</div>
//                   <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
//                 </div>
//               </div>
//             </>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }


























// src/pages/EmployeeDashboard.tsx
import { useEffect, useMemo, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { getEmployees } from '../services/api';

type Employee = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  department?: string;
  createdAt?: string;
};

export default function EmployeeDashboard(): JSX.Element {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name-asc' | 'name-desc'>('newest');

  // pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // load employees (normalizes common shapes)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);

      // Avoid calling protected API when no token present (prevents 401)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        if (mounted) {
          setError('Not authenticated. Please sign in to view employees.');
          setLoading(false);
        }
        return;
      }

      try {
        const res: any = await getEmployees().catch(() => []);
        // normalize shapes: array | { content: [...] } | { data: [...] } | object
        const raw = Array.isArray(res) ? res : res?.content || res?.data || res;
        if (!mounted) return;
        setEmployees(raw || []);
      } catch (err: any) {
        console.error('Failed to load employees', err);
        if (mounted) {
          if (err?.status === 401) setError('Session expired or unauthorized. Please login again.');
          else setError('Failed to load employees');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let out = employees.slice();

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(e =>
        String(e.name || '').toLowerCase().includes(q) ||
        String(e.email || '').toLowerCase().includes(q) ||
        String(e.department || '').toLowerCase().includes(q)
      );
    }

    if (tab === 'active') {
      out = out.filter(e => (String(e.status || '').toLowerCase() === 'active' || String(e.status || '').toLowerCase() === 'enabled'));
    } else if (tab === 'inactive') {
      out = out.filter(e => (String(e.status || '').toLowerCase() === 'inactive' || String(e.status || '').toLowerCase() === 'disabled' || !e.status));
    }

    if (sortBy === 'name-asc') out.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    else if (sortBy === 'name-desc') out.sort((a, b) => String(b.name || '').localeCompare(String(a.name || '')));
    else out.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    return out;
  }, [employees, query, tab, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage employees, roles and status.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              aria-label="Search employees"
              placeholder="Search by name, email or department..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-md border bg-white shadow-sm text-sm w-80"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-md border bg-white text-sm"
            >
              <option value="newest">Newest</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
            </select>

            <Link to="/employees/new" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm">
              + Add Employee
            </Link>
          </div>
        </div>

        {/* stats + tabs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-slate-500">Total Employees</div>
            <div className="text-2xl font-semibold">{employees.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-slate-500">Active</div>
            <div className="text-2xl font-semibold">{employees.filter(e => String(e.status || '').toLowerCase() === 'active').length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-slate-500">Inactive</div>
            <div className="text-2xl font-semibold">{employees.filter(e => String(e.status || '').toLowerCase() !== 'active').length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-slate-500">Departments</div>
            <div className="text-2xl font-semibold">{Array.from(new Set(employees.map(e => e.department || 'Unassigned'))).length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {(['all','active','inactive'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(1); }}
                className={`px-3 py-2 rounded-full text-sm ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white shadow-sm text-slate-700'}`}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="text-sm text-slate-500">Showing {(page-1)*PAGE_SIZE + 1} - {Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</div>
        </div>

        {/* Content */}
        <section>
          {loading && (
            <div className="grid grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {error && <div className="p-4 bg-red-50 text-red-700 rounded mb-4">{error}</div>}

          {!loading && filtered.length === 0 && (
            <div className="p-8 bg-white rounded shadow text-center">No employees found — try clearing filters or add a new employee.</div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-6">
                {pageItems.map(emp => (
                  <div key={String(emp.id)} className="bg-white rounded-lg shadow p-4 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold">{emp.name || `#${emp.id}`}</div>
                        <div className="text-sm text-slate-500">{emp.email}</div>
                        <div className="text-sm text-slate-500 mt-2">{emp.department || 'Unassigned'}</div>
                      </div>

                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs ${String(emp.status || '').toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {emp.status || 'Inactive'}
                        </div>
                        <div className="text-sm text-slate-400 mt-2">{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '—'}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link to={`/employees/${emp.id}`} className="px-3 py-2 border rounded text-sm">View</Link>
                      <Link to={`/employees/${emp.id}/edit`} className="px-3 py-2 border rounded text-sm">Edit</Link>
                      <button className="ml-auto px-3 py-2 bg-indigo-600 text-white rounded text-sm">Message</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* pagination */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-500">Page {page} of {totalPages}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                  <div className="px-3">{page} / {totalPages}</div>
                  <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
