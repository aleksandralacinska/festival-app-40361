const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchLocations() {
  const r = await fetch(`${API_URL}/api/locations`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!r.ok) throw new Error('locations_fetch_failed');
  return r.json(); // oczekuje: [{id,name,type,lat,lng,description}, ...]
}
