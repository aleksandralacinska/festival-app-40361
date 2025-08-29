const RAW = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const BASE = RAW.replace(/\/+$/, '');

const API_URL = BASE.endsWith('/api') ? BASE : `${BASE}/api`;

export const API_ORIGIN = BASE.replace(/\/api$/, '');

export { API_URL };

export function authHeaders() {
  const t = localStorage.getItem('auth_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// zdrowie API (uwaga: bez kolejnego /api, bo API_URL już je zawiera)
export async function getHealth() {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}
