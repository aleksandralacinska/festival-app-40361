const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function loginWithPin(teamName, pin) {
  const r = await fetch(`${API_URL}/api/auth/pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName, pin })
  });
  if (!r.ok) throw new Error('pin_login_failed');
  const data = await r.json();
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('team_name', data.team?.name || '');
  return data;
}

export function getToken() {
  return localStorage.getItem('auth_token');
}

export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('team_name');
}
