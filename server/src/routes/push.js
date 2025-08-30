const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');
const { sendToAll, sendToTeam, sendReminder } = require('../services/pushService');

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

// POST /api/push/run-reminders (admin)
// uruchamiaj cyklicznie (cron) co 1 min lub ręcznie: sprawdza okna T-30 i T-15 (z buforem 1 min)
router.post('/run-reminders', requireAdmin, async (_req, res, next) => {
  try {
    const minutesSet = [30, 15];
    let total = { '30': { sent: 0, failed: 0 }, '15': { sent: 0, failed: 0 } };

    for (const min of minutesSet) {
      const { rows: events } = await pool.query(
        `
        WITH due AS (
          SELECT e.*
          FROM events e
          WHERE e.start_time BETWEEN (NOW() + ($1 || ' minutes')::interval)
                                AND (NOW() + ($1 || ' minutes')::interval + INTERVAL '1 minute')
        )
        SELECT d.*
        FROM due d
        LEFT JOIN event_reminder_log l
          ON l.event_id = d.id AND l.at_minutes = $1::int
        WHERE l.event_id IS NULL
        ORDER BY d.start_time ASC
        `,
        [min]
      );

      for (const ev of events) {
        try {
          const r = await sendReminder(ev, min);
          total[String(min)].sent += r.sent;
          total[String(min)].failed += r.failed;
          await pool.query(
            `INSERT INTO event_reminder_log (event_id, at_minutes, sent_at)
             VALUES ($1,$2,NOW())
             ON CONFLICT (event_id, at_minutes) DO NOTHING`,
            [ev.id, min]
          );
        } catch {
          // log błąd wysyłki, ale nie przerywaj
        }
      }
    }
    res.json({ ok: true, total });
  } catch (e) { next(e); }
});

module.exports = router;
