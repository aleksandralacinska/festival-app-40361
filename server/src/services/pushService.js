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

module.exports = {
  sendToAll,
  sendToTeam,
};
