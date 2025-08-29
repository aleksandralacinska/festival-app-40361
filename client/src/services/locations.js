import { API_URL } from './api';

export async function fetchLocations() {
  const r = await fetch(`${API_URL}/locations`, { headers: { 'Accept': 'application/json' } });
  if (!r.ok) throw new Error('locations_fetch_failed');
  return r.json();
}
