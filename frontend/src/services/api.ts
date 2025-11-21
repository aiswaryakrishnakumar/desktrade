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
 */
export async function createEmployee(payload: any) {
  const rawRole =
    payload?.role ||
    (payload?.roles && Array.isArray(payload.roles) && payload.roles[0]) ||
    (payload?.roles && typeof payload.roles === 'string' && payload.roles) ||
    'employee';

  const roleUpper = String(rawRole).toUpperCase().replace(/^ROLE_/, '');
  const roleLower = roleUpper.toLowerCase();

  const body = {
    ...payload,
    role: roleLower,
    roles: [roleUpper],
  };

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

/* Items admin actions (approve/reject) */
export async function approveItem(itemId: string | number) {
  return req(`/api/items/admin/${itemId}/approve`, { method: 'POST' });
}

export async function rejectItem(itemId: string | number, body: any = {}) {
  // If backend expects reason param as request param (GET-style), adjust; we use body JSON.
  return req(`/api/items/admin/${itemId}/reject`, { method: 'POST', body: JSON.stringify(body) });
}

/* Create item */
export async function createItem(payload: any) {
  return req('/api/items', { method: 'POST', body: JSON.stringify(payload) });
}

/**
 * Upload an image for an item.
 * Sends multipart/form-data with field 'file' to POST /api/items/{id}/image
 */
export async function uploadItemImage(itemId: number | string, file: File) {
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';
  // If API_BASE already contains '/api' ensure not duplicated
  const base = API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE;
  const url = `${base}/api/items/${itemId}/image`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fd = new FormData();
  fd.append('file', file);

  const headers: Record<string,string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: fd
  });

  if (!res.ok) {
    let body = null;
    try { body = await res.json(); } catch {}
    const err: any = new Error((body && (body.message || body.error)) || `Upload failed: ${res.status}`);
    err.body = body;
    throw err;
  }

  const data = await res.json().catch(() => ({}));
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
  createItem,
  approveItem,
  rejectItem,
  uploadItemImage,
};
