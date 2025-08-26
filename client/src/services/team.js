import { API_URL, authHeaders } from './api';

export async function getMyTeam() {
  const r = await fetch(`${API_URL}/api/team/me`, { headers: { ...authHeaders() } });
  if (!r.ok) throw new Error('team_fetch_failed');
  return r.json();
}
