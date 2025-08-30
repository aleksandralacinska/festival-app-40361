require('dotenv').config();
const webpush = require('web-push');
const { pool } = require('../config/db');

const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
const PUB = process.env.VAPID_PUBLIC_KEY;
const PRIV = process.env.VAPID_PRIVATE_KEY;

if (!PUB || !PRIV) {
  console.warn('[pushService] Missing VAPID keys – push will fail.');
}
webpush.setVapidDetails(SUBJECT, PUB, PRIV);

// === bazowe wysyłki ===
async function getSubscriptions(teamId = null) {
  const args = [];
  let q = `SELECT id, endpoint, p256dh, auth FROM push_subscriptions`;
  if (teamId) { q += ` WHERE team_id=$1`; args.push(teamId); }
  const { rows } = await pool.query(q, args);
  return rows.map(r => ({
    endpoint: r.endpoint,
    keys: { p256dh: r.p256dh, auth: r.auth }
  }));
}

async function sendToSubs(payload, subs) {
  let sent = 0, failed = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(s, JSON.stringify(payload));
      sent++;
    } catch {
      failed++;
    }
  }));
  return { sent, failed };
}

async function sendToAll(payload) {
  const subs = await getSubscriptions(null);
  return sendToSubs(payload, subs);
}

async function sendToTeam(teamId, payload) {
  const subs = await getSubscriptions(teamId);
  return sendToSubs(payload, subs);
}

// === helpery eventów ===
function audienceForEvent(ev) {
  // publiczny -> wszyscy; teamowy -> konkretny team
  if (ev && ev.team_id) return { scope: 'team', teamId: Number(ev.team_id) };
  return { scope: 'all', teamId: null };
}
function buildEventUrl(id) {
  return `/event/${id}`;
}
function changedMeaningfully(before, after) {
  if (!before || !after) return true;
  const keys = ['name','start_time','end_time','location_id','category','team_id','is_public'];
  return keys.some(k => String(before[k] ?? '') !== String(after[k] ?? ''));
}

// powiadomienie po utworzeniu
async function notifyEventCreate(ev) {
  const aud = audienceForEvent(ev);
  const payload = {
    title: 'Aktualizacja programu',
    body: `Dodano: ${ev.name}`,
    url: buildEventUrl(ev.id),
    tag: `event-create-${ev.id}`,
    renotify: true
  };
  return aud.scope === 'team'
    ? sendToTeam(aud.teamId, payload)
    : sendToAll(payload);
}

// powiadomienie po zmianie (PUT)
async function notifyEventUpdate(before, after) {
  if (!changedMeaningfully(before, after)) return { sent: 0, failed: 0 };
  const aud = audienceForEvent(after);
  const payload = {
    title: 'Zmiana w programie',
    body: `${after.name}`,
    url: buildEventUrl(after.id),
    tag: `event-update-${after.id}`,
    renotify: true
  };
  return aud.scope === 'team'
    ? sendToTeam(aud.teamId, payload)
    : sendToAll(payload);
}

// przypomnienie 30/15 min
async function sendReminder(event, minutes) {
  const aud = audienceForEvent(event);
  const payload = {
    title: `Przypomnienie (${minutes} min)`,
    body: `${event.name}`,
    url: buildEventUrl(event.id),
    tag: `event-reminder-${event.id}-${minutes}`,
    renotify: true
  };
  return aud.scope === 'team'
    ? sendToTeam(aud.teamId, payload)
    : sendToAll(payload);
}

module.exports = {
  sendToAll,
  sendToTeam,
  notifyEventCreate,
  notifyEventUpdate,
  sendReminder,
};
