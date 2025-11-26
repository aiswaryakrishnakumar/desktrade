// src/services/api.ts

export type Category = {
  id?: number;
  name: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * API base (Vite env var VITE_API_BASE or fallback '/api')
 */
export const API_BASE: string = (import.meta as any)?.env?.VITE_API_BASE ?? '/api';

/* ---------- Domain types ---------- */
export type Item = {
  id?: number;
  title?: string;
  name?: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  price?: number;
  category?: string | number;
  categoryName?: string;
  sellerName?: string;
  availableQuantity?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Booking = {
  id?: number;
  itemId?: number;
  buyerId?: number;
  status?: string;
  bookedAt?: string;
};

/* ---------- Low-level helpers ---------- */

/** Use a plain indexable headers object when we need to mutate values */
function jsonHeaders(): Record<string,string> {
  return { 'Content-Type': 'application/json', Accept: 'application/json' };
}

function authHeaders(): Record<string,string> {
  const headers: Record<string,string> = jsonHeaders();
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/** Normalize responses and throw consistent errors */
async function handleResponse(res: Response) {
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch(e) { data = text; }
  if (!res.ok) {
    const err: any = new Error(data?.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/* ---------- Generic fetch helpers (use Record<string,string> headers while mutating) ---------- */

/** GET */
export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'GET', headers: authHeaders() as HeadersInit, credentials: 'include' });
  return handleResponse(res);
}

/** POST with auth (JSON body) */
export async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: authHeaders() as HeadersInit, credentials: 'include', body: JSON.stringify(body) });
  return handleResponse(res);
}

/** POST without auth (JSON) */
export async function apiPostNoAuth(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: jsonHeaders() as HeadersInit, body: JSON.stringify(body) });
  return handleResponse(res);
}

/** PUT */
export async function apiPut(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'PUT', headers: authHeaders() as HeadersInit, credentials: 'include', body: JSON.stringify(body) });
  return handleResponse(res);
}

/** DELETE */
export async function apiDelete(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: authHeaders() as HeadersInit, credentials: 'include' });
  return handleResponse(res);
}

/**
 * Lightweight `api()` wrapper for callers that used `api()` directly.
 * Accepts full RequestInit so it can be used for multipart FormData as well.
 */
export async function api(path: string, opts: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // build a plain record so we can safely set keys
  const headersObj: Record<string,string> = {};
  if (opts.headers) {
    // copy known header types (Headers, array, or object)
    if (opts.headers instanceof Headers) {
      opts.headers.forEach((v,k) => headersObj[k] = v);
    } else if (Array.isArray(opts.headers)) {
      (opts.headers as [string,string][]).forEach(([k,v]) => headersObj[k] = v);
    } else {
      Object.assign(headersObj, opts.headers as Record<string,string>);
    }
  }

  // only set content-type automatically if body is not FormData
  if (!(opts.body instanceof FormData)) {
    headersObj['Content-Type'] = headersObj['Content-Type'] || 'application/json';
  }
  if (token) headersObj['Authorization'] = headersObj['Authorization'] || `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: headersObj as HeadersInit,
    credentials: 'include',
  });
  return handleResponse(res);
}

/* ---------------------------
   Category helpers
   --------------------------- */

export async function fetchAdminCategories(): Promise<Category[] | any> {
  try {
    return await apiGet('/categories/admin');
  } catch (e) {
    return await apiGet('/categories');
  }
}

export async function fetchCategories(): Promise<Category[]> {
  return apiGet('/categories');
}

export async function approveCategory(categoryId: number): Promise<any> {
  return apiPost(`/categories/${categoryId}/approve`, {});
}

export async function rejectCategory(categoryId: number, reason?: string): Promise<any> {
  const qs = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  return apiPost(`/categories/${categoryId}/reject${qs}`, {});
}

/** Backwards-compat alias - some files import `deleteCategory` */
export async function deleteCategoryByAdmin(categoryId: number): Promise<any> {
  return apiDelete(`/categories/${categoryId}`);
}
export const deleteCategory = deleteCategoryByAdmin; // alias for old imports


/* ---------------------------
   Items / Admin helpers (existing)
   --------------------------- */

export async function fetchItems() {
  return apiGet("/items");
}

export async function fetchPendingItems(page = 0, size = 50): Promise<any> {
  return apiGet(`/items/admin/pending?page=${page}&size=${size}`);
}

export async function fetchApprovedItemsByCategory(categoryId: number, page = 0, size = 50): Promise<any> {
  return apiGet(`/items/by-category/${categoryId}?page=${page}&size=${size}`);
}

export async function approveItemByAdmin(itemId: number): Promise<any> {
  return apiPost(`/items/admin/${itemId}/approve`, {});
}

export async function rejectItemByAdmin(itemId: number, reason?: string): Promise<any> {
  const qs = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  return apiPost(`/items/admin/${itemId}/reject${qs}`, {});
}

/* ---------------------------
   Employee-side helpers
   --------------------------- */

export async function employeeLogin(email: string, password: string): Promise<any> {
  return apiPostNoAuth('/auth/login', { email, password });
}

export async function employeeLogout(): Promise<void> {
  if (typeof window !== 'undefined') localStorage.removeItem('token');
}

export async function fetchItemsForEmployee(opts?: {
  search?: string;
  categoryId?: number | string;
  page?: number;
  size?: number;
}): Promise<any> {
  const q: string[] = [];
  if (opts?.search) q.push(`search=${encodeURIComponent(opts.search)}`);
  if (opts?.categoryId !== undefined && opts?.categoryId !== '') q.push(`category=${encodeURIComponent(String(opts.categoryId))}`);
  const page = opts?.page ?? 0;
  const size = opts?.size ?? 50;
  q.push(`page=${page}`, `size=${size}`);
  const path = `/items${q.length ? ('?' + q.join('&')) : ''}`;
  return apiGet(path);
}

export async function fetchMyItems(page = 0, size = 50): Promise<any> {
  return apiGet(`/items/mine?page=${page}&size=${size}`);
}

/** multipart upload for employee item creation */
// export async function createItemForEmployee(payload: {
//   title: string;
//   description?: string;
//   price?: number | null;
//   condition?: string;
//   category?: number | string;
//   images?: File[] | null;
// }): Promise<any> {
//   const fd = new FormData();
//   fd.append('title', payload.title);
//   if (payload.description) fd.append('description', payload.description);
//   if (payload.price !== undefined && payload.price !== null) fd.append('price', String(payload.price));
//   if (payload.condition) fd.append('condition', payload.condition);
//   if (payload.category !== undefined && payload.category !== null) fd.append('category', String(payload.category));
//   if (payload.images && payload.images.length) payload.images.forEach(f => fd.append('images', f));

//   const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//   const headers: Record<string,string> = {};
//   if (token) headers['Authorization'] = `Bearer ${token}`;

//   const res = await fetch(`${API_BASE}/items`, {
//     method: 'POST',
//     headers: headers as HeadersInit,
//     credentials: 'include',
//     body: fd,
//   });
//   return handleResponse(res);
// }

export async function updateItemForEmployee(itemId: number | string, body: any): Promise<any> {
  return apiPut(`/items/${itemId}`, body);
}

export async function deleteItemForEmployee(itemId: number | string): Promise<any> {
  return apiDelete(`/items/${itemId}`);
}

export async function bookItem(itemId: number | string, body?: any): Promise<any> {
  return apiPost(`/items/${itemId}/book`, body ?? {});
}

export async function fetchBookingsForEmployee(page = 0, size = 50): Promise<any> {
  return apiGet(`/bookings?page=${page}&size=${size}`);
}

// NOTE: fetchApprovedItems was declared later in your original file. We include it here.

export async function fetchApprovedItems(opts?: {
  search?: string;
  category?: string | number;
  page?: number;
  size?: number;
}) {
  const q: string[] = [];
  if (opts?.search) q.push(`search=${encodeURIComponent(opts.search)}`);
  if (opts?.category !== undefined && opts?.category !== '') q.push(`category=${encodeURIComponent(String(opts.category))}`);
  q.push('status=approved');
  if (opts?.page !== undefined) q.push(`page=${opts.page}`);
  if (opts?.size !== undefined) q.push(`size=${opts.size}`);
  const qs = q.length ? `?${q.join('&')}` : '';
  return apiGet(`/items${qs}`);
}

/* ---------------------------
   Orders / Booking helpers
   --------------------------- */

/**
 * Create an order / booking for an item.
 *
 * Backend expects a top-level JSON array of order item DTOs:
 *   POST /api/orders  ->  [ { itemId: number, qty?: number, notes?: string, ... }, ... ]
 *
 * This helper is flexible:
 *  - If you pass an array already, it sends it as-is.
 *  - If you pass a single object { itemId, qty, notes }, it will send [object].
 *  - If you pass { items: [...] } it will send items array.
 */
export async function createOrder(payload:
  | { itemId: number; qty?: number; notes?: string }
  | Array<{ itemId: number; qty?: number; notes?: string }>
  | { items: Array<{ itemId: number; qty?: number; notes?: string }> }
) {
  // Normalize to top-level array to satisfy backend
  let body: any;
  if (Array.isArray(payload)) {
    body = payload;
  } else if ((payload as any).items && Array.isArray((payload as any).items)) {
    body = (payload as any).items;
  } else {
    // single item object
    body = [payload];
  }

  return apiPost("/orders", body);
}

/** Get current user's orders / bookings */
export async function fetchMyOrders() {
  return apiGet("/orders/me");
}

/* ---------------------------
   Reviews
   --------------------------- */

/** List reviews for an item */
export async function fetchItemReviews(itemId: number | string) {
  return apiGet(`/items/${itemId}/reviews`);
}

/** Post a review for an item (authenticated) */
export async function postReview(itemId: number | string, body: { rating: number; comment?: string }) {
  return apiPost(`/items/${itemId}/reviews`, body);
}

// export async function createItemForEmployee(payload: {
//   title: string;
//   description?: string;
//   price?: number;
//   condition?: string;
//   category?: number | string;
// }) {
//   const token = localStorage.getItem("token"); // adjust key if you store token elsewhere
//   const url = `${API_BASE}/items`;

//   const form = new FormData();
//   form.append("title", payload.title);
//   if (payload.description !== undefined) form.append("description", payload.description);
//   if (payload.price !== undefined) form.append("price", String(payload.price));
//   if (payload.condition !== undefined) form.append("condition", payload.condition);
//   if (payload.category !== undefined && payload.category !== "") {
//     // send category id or name depending on what backend expects
//     form.append("category", String(payload.category));
//   }


//   const headers: Record<string, string> = {};
//   if (token) headers["Authorization"] = `Bearer ${token}`;

//   const res = await fetch(url, {
//     method: "POST",
//     headers, // do NOT set Content-Type; browser sets multipart boundary
//     body: form,
//   });

//   if (!res.ok) {
//     // try to parse an error message from response
//     let msg = `Request failed: ${res.status} ${res.statusText}`;
//     try {
//       const errJson = await res.json();
//       // adjust depending on your error shape
//       msg = errJson?.message ?? JSON.stringify(errJson);
//     } catch (e) {
//       // ignore parse errors
//     }
//     throw new Error(msg);
//   }

//   // backend returns created ItemDto
//   const data = await res.json();
//   return data;
// }




export async function createItemForEmployee(body: {
  title: string;
  description?: string;
  price?: number;
  quantity?: number;
  categoryId: number;
}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Failed to create item");
  }

  return res.json();
}

/* ---------------------------
   End of API helpers
   --------------------------- */
