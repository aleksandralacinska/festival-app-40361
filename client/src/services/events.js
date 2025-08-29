import { API_URL } from './api';

export async function fetchPublicEvents() {
  const r = await fetch(`${API_URL}/events`, { headers: { 'Accept': 'application/json' } });
  if (!r.ok) throw new Error('events_fetch_failed');
  return r.json();
}
