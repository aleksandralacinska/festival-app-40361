import { API_URL } from './api';

export async function loginWithPin(slug, pin) {
  const body = new URLSearchParams({ slug, pin });
  const r = await fetch(`${API_URL}/auth/pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!r.ok) throw new Error('pin_login_failed');
  const data = await r.json();
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('team_name', data.team?.name || '');
  localStorage.setItem('team_slug', data.team?.slug || '');
  return data;
}

export function getToken() { return localStorage.getItem('auth_token'); }
export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('team_name');
  localStorage.removeItem('team_slug');
}
export function getTeamName() { return localStorage.getItem('team_name') || ''; }
export function getTeamSlug() { return localStorage.getItem('team_slug') || ''; }
