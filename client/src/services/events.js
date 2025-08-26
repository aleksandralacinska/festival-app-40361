const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/** Pobiera WYŁĄCZNIE publiczne wydarzenia (koncerty, parada, ceremonia, fajerwerki) */
export async function fetchPublicEvents() {
  const r = await fetch(`${API_URL}/api/events`, { headers: { 'Accept': 'application/json' } });
  if (!r.ok) throw new Error('events_fetch_failed');
  return r.json();
}
