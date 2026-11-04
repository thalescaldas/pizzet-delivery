// ADAPTADOR DE API: Claude Code deve alinhar as rotas com a API ASP.NET Core.
// Sem URL configurada, somente o catálogo usa dados de demonstração.
import { demoProducts } from './data.js';
const base = (window.PIZZET_API_URL || localStorage.getItem('pizzet_api_url') || '').replace(/\/$/, '');
export const isDemo = !base;
async function request(path, { method = 'GET', body } = {}) {
  if (!base) throw new Error('API não configurada. Conecte o back-end C# para utilizar esta função.');
  const response = await fetch(`${base}${path}`, {
    method,
    credentials: 'include',
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {}
    throw new Error(error?.message || error?.title || `Erro HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}
export const api = {
  products: () => (isDemo ? Promise.resolve(demoProducts) : request('/api/products')),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  register: (data) => request('/api/auth/register', { method: 'POST', body: data }),
  me: () => request('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  updateProfile: (data) => request('/api/users/me', { method: 'PUT', body: data }),
  orders: () => request('/api/orders'),
  createOrder: (data) => request('/api/orders', { method: 'POST', body: data }),
  order: (id) => request(`/api/orders/${encodeURIComponent(id)}`),
  // CRUD administrativo previsto para a integração:
  createProduct: (data) => request('/api/products', { method: 'POST', body: data }),
  updateProduct: (id, data) =>
    request(`/api/products/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  updateOrderStatus: (id, status) =>
    request(`/api/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } }),
};
