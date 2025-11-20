// src/services/api.ts
const API_BASE = (import.meta as any).env?.VITE_API_BASE || ''; // '' => same origin

function authHeaders(): Record<string,string> {
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
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

/* Existing helpers you already have (getItems/getCategoriesAdmin/createCategory etc.) */
export async function getCategoriesAdmin() {
  // call admin list endpoint
  const r: any = await req('/api/categories/admin', { method: 'GET' });
  const raw = Array.isArray(r) ? r : r?.content || r?.data || r;
  return raw;
}

export async function createCategory(payload: any) {
  // creates with PENDING by backend; return created resource
  return req('/api/categories', { method: 'POST', body: JSON.stringify(payload) });
}

export async function createEmployee() {
  
}

/* NEW: approve / reject endpoints (POST) */
export async function approveCategory(categoryId: string | number) {
  return req(`/api/categories/${categoryId}/approve`, { method: 'POST' });
}
export async function rejectCategory(categoryId: string | number, body: any = {}) {
  // optional body (reason) if your backend accepts it
  return req(`/api/categories/${categoryId}/reject`, { method: 'POST', body: JSON.stringify(body) });
}

/* export others if needed */
export async function getItems() { return req('/api/items?page=0&size=1000', { method: 'GET' }); }
export async function getEmployees() { return req('/api/employees?page=0&size=1000', { method: 'GET' }); }

export default {
  req, getCategoriesAdmin, createCategory, approveCategory, rejectCategory, getItems, getEmployees
};
