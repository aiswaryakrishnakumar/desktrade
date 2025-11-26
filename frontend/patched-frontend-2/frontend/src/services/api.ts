// src/services/api.ts
// Central API helper for frontend -> backend calls.
// - Uses VITE_API_BASE if provided; otherwise same origin.
// - req() attaches Authorization: Bearer <token> when token present in localStorage.
// - Provides convenience functions used by the app.

const API_BASE = (import.meta as any).env?.VITE_API_BASE || ''; // '' => same origin

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function req(path: string, opts: RequestInit = {}) {
  const url = API_BASE + path;
  const res = await fetch(url, { headers: { ...(opts.headers || {}), ...authHeaders() }, ...opts });
  const text = await res.text().catch(() => '');
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err: any = new Error((data && data.message) || res.statusText || `HTTP ${res.status}`);
    err.status = res.status; err.body = data;
    throw err;
  }
  return data;
}

/* Categories (admin) */
export async function getCategoriesAdmin() {
  const r: any = await req('/api/categories/admin', { method: 'GET' });
  const raw = Array.isArray(r) ? r : r?.content || r?.data || r;
  return raw;
}

export async function createCategory(payload: any) {
  return req('/api/categories', { method: 'POST', body: JSON.stringify(payload) });
}

export async function approveCategory(categoryId: string | number) {
  return req(`/api/categories/${categoryId}/approve`, { method: 'POST' });
}
export async function rejectCategory(categoryId: string | number, body: any = {}) {
  return req(`/api/categories/${categoryId}/reject`, { method: 'POST', body: JSON.stringify(body) });
}

/* Items / Employees listing helpers */
export async function getItems() {
  return req('/api/items?page=0&size=1000', { method: 'GET' });
}
export async function getEmployees() {
  return req('/api/employees?page=0&size=1000', { method: 'GET' });
}

/**
 * Create an employee (registration endpoint).
 * This function normalizes role and sends both:
 *  - role (lowercase string) to match examples like "employee"
 *  - roles (uppercase array) to support backends expecting roles array / authorities
 *
 * Expected payload (frontend side): { name, email, password, role?, department? }
 * We'll normalize role to be safe.
 */
export async function createEmployee(payload: any) {
  // Determine a single role value from input
  const rawRole =
    payload?.role ||
    (payload?.roles && Array.isArray(payload.roles) && payload.roles[0]) ||
    (payload?.roles && typeof payload.roles === 'string' && payload.roles) ||
    'employee';

  // Normalize: produce uppercase for roles array, lowercase for simple `role` (matches your swagger examples)
  const roleUpper = String(rawRole).toUpperCase().replace(/^ROLE_/, '');
  const roleLower = roleUpper.toLowerCase();

  // Build body: include both `role` and `roles` for maximum compatibility
  const body = {
    ...payload,
    // ensure backend receives a simple 'role' field (common in your existing register example)
    role: roleLower,
    // and an uppercase roles array for servers that expect ROLE-like authority lists
    roles: [roleUpper],
  };

  // POST to registration endpoint (public)
  const url = API_BASE + '/api/auth/register';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const err: any = new Error((data && data.message) || res.statusText || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/* Export default object for convenience imports */
export default {
  req,
  getCategoriesAdmin,
  createCategory,
  approveCategory,
  rejectCategory,
  getItems,
  getEmployees,
  createEmployee,
};
