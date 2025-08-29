import { API_URL } from './api';
import { getToken } from './auth';

export async function getMyTeam() {
  const r = await fetch(`${API_URL}/team/me`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (r.status === 401 || r.status === 403) {
    const err = new Error('unauthorized');
    err.code = 401;
    throw err;
  }
  if (!r.ok) throw new Error('team_fetch_failed');
  return r.json();
}
