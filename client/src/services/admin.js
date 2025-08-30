import { API_URL } from './api';
const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API = `${API_ORIGIN}/api`;

export function setAdminToken(t){ localStorage.setItem('admin_token', t); }
export function getAdminToken(){ return localStorage.getItem('admin_token'); }

export async function adminLogin(user, pass){
  const r = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ user, pass })
  });
  if (!r.ok) throw new Error('admin_login_failed');
  return r.json();
}

export async function adminCreateEvent(data){
  const r = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: {'Content-Type':'application/json', Authorization: `Bearer ${getAdminToken()}`},
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('create_event_failed');
  return r.json();
}

export async function adminUpdateEvent(id, data){
  const r = await fetch(`${API_URL}/events/${id}`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json', Authorization: `Bearer ${getAdminToken()}`},
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('update_event_failed');
  return r.json();
}

export async function adminFetchEventsAll(){
  const r = await fetch(`${API}/events/all`, { headers: { Authorization: `Bearer ${getAdminToken()}` }});
  if (!r.ok) throw new Error('events_all_failed');
  return r.json();
}

export async function adminDeleteEvent(id){
  const r = await fetch(`${API}/events/${id}`, {
    method:'DELETE',
    headers: { Authorization: `Bearer ${getAdminToken()}` }
  });
  if (!r.ok) throw new Error('delete_event_failed');
  return r.json();
}

export async function adminCreateLocation(data){
  const r = await fetch(`${API_URL}/locations`, {
    method: 'POST',
    headers: {'Content-Type':'application/json', Authorization: `Bearer ${getAdminToken()}`},
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('create_location_failed');
  return r.json();
}

export async function adminUpdateLocation(id, data){
  const r = await fetch(`${API}/locations/${id}`, {
    method:'PUT',
    headers: {'Content-Type':'application/json', Authorization: `Bearer ${getAdminToken()}`},
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('update_location_failed');
  return r.json();
}
export async function adminDeleteLocation(id){
  const r = await fetch(`${API}/locations/${id}`, {
    method:'DELETE',
    headers: { Authorization: `Bearer ${getAdminToken()}` }
  });
  if (!r.ok) throw new Error('delete_location_failed');
  return r.json();
}

export async function adminGetTeams(){
  const r = await fetch(`${API_URL}/teams`, { headers: { Authorization: `Bearer ${getAdminToken()}` }});
  if (!r.ok) throw new Error('get_teams_failed');
  return r.json();
}

export async function adminSetTeamPin(id, pin){
  const r = await fetch(`${API_URL}/teams/${id}/pin`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json', Authorization: `Bearer ${getAdminToken()}`},
    body: JSON.stringify({ pin })
  });
  if (!r.ok) throw new Error('set_pin_failed');
  return r.json();
}

export async function adminPushBroadcast({ title, body, url, teamId }){
  const r = await fetch(`${API_URL}/push/broadcast`, {
    method: 'POST',
    headers: {'Content-Type':'application/json', Authorization: `Bearer ${getAdminToken()}`},
    body: JSON.stringify({ title, body, url: url || null, teamId: teamId || null })
  });
  if (!r.ok) throw new Error('push_failed');
  return r.json();
}

export async function adminCreateTeam(data){
  const r = await fetch(`${API}/teams`, {
    method:'POST',
    headers: {'Content-Type':'application/json', Authorization: `Bearer ${getAdminToken()}`},
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('create_team_failed');
  return r.json();
}

export async function adminUpdateTeam(id, data){
  const r = await fetch(`${API}/teams/${id}`, {
    method:'PUT',
    headers: {'Content-Type':'application/json', Authorization: `Bearer ${getAdminToken()}`},
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('update_team_failed');
  return r.json();
}

export async function adminDeleteTeam(id){
  const r = await fetch(`${API}/teams/${id}`, {
    method:'DELETE',
    headers: { Authorization: `Bearer ${getAdminToken()}` }
  });
  if (!r.ok) throw new Error('delete_team_failed');
  return r.json();
}
