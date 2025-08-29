const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');
const { sendToAll, sendToTeam } = require('../services/pushService');

// POST /api/push/subscribe { endpoint, keys:{p256dh,auth}, teamId? }
const { pool } = require('../config/db');
router.post('/subscribe', async (req, res, next) => {
  try {
    const { endpoint, keys, teamId } = req.body || {};
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'invalid_subscription' });
    }
    await pool.query(
      `INSERT INTO push_subscriptions (endpoint, p256dh, auth, team_id)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (endpoint) DO UPDATE
         SET p256dh=EXCLUDED.p256dh, auth=EXCLUDED.auth, team_id=EXCLUDED.team_id`,
      [endpoint, keys.p256dh, keys.auth, teamId || null]
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// DELETE /api/push/unsubscribe { endpoint }
router.delete('/unsubscribe', async (req, res, next) => {
  try {
    const { endpoint } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: 'invalid_endpoint' });
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint=$1', [endpoint]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// POST /api/push/broadcast (admin) { title, body, url?, teamId? }
router.post('/broadcast', requireAdmin, async (req, res, next) => {
  try {
    const { title, body, url, teamId } = req.body || {};
    if (!title || !body) return res.status(400).json({ error: 'title_body_required' });
    const payload = { title, body, url: url || '/' };
    const result = teamId ? await sendToTeam(Number(teamId), payload) : await sendToAll(payload);
    res.json({ ok: true, ...result });
  } catch (e) { next(e); }
});

module.exports = router;
