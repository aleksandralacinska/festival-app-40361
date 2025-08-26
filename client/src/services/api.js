const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export { API_URL };

export function authHeaders() {
  const t = localStorage.getItem('auth_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function getHealth() {
  const res = await fetch(`${API_URL}/api/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}
