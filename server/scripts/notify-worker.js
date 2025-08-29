require('dotenv').config();
const { pool } = require('../src/config/db');
const { sendToAll, sendToTeam } = require('../src/services/pushService');

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function cycleOnce() {
  // 1) znajdź eventy na 30 i 15 minut
  // tylko eventy publiczne lub z przypisanym zespołem (team_id)
  const sql = `
    WITH cand AS (
      SELECT e.*
      FROM events e
      WHERE e.start_time BETWEEN NOW() + $1::interval AND NOW() + ($1::interval + interval '59 seconds')
         OR e.start_time BETWEEN NOW() + $2::interval AND NOW() + ($2::interval + interval '59 seconds')
    )
    SELECT c.*, 
           CASE 
             WHEN c.start_time BETWEEN NOW() + $1::interval AND NOW() + ($1::interval + interval '59 seconds') THEN 'reminder_30'
             ELSE 'reminder_15'
           END AS rtype
    FROM cand c
    LEFT JOIN sent_notifications s ON s.event_id = c.id 
       AND s.type IN ('reminder_30','reminder_15')
    WHERE s.id IS NULL
      AND (c.is_public IS DISTINCT FROM FALSE OR c.team_id IS NOT NULL)
    ORDER BY c.start_time ASC;
  `;
  const { rows } = await pool.query(sql, ['30 minutes', '15 minutes']);

  if (rows.length === 0) return { checked: 0, sent: 0, skipped: 0 };

  let sent = 0, skipped = 0;
  for (const ev of rows) {
    const title = ev.rtype === 'reminder_30' ? 'Przypomnienie (30 min)' : 'Przypomnienie (15 min)';
    const time = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' })
      .format(new Date(ev.start_time));
    const body = `${ev.name} • start: ${time}`;
    const url = `/event/${ev.id}`;

    try {
      if (ev.team_id) {
        const res = await sendToTeam(ev.team_id, { title, body, url });
        if (res.sent > 0) sent += res.sent;
      } else {
        const res = await sendToAll({ title, body, url });
        if (res.sent > 0) sent += res.sent;
      }
      // oznacz jako wysłane (idempotentnie)
      await pool.query(
        `INSERT INTO sent_notifications (event_id, type) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [ev.id, ev.rtype]
      );
    } catch {
      skipped++;
    }
  }
  return { checked: rows.length, sent, skipped };
}

(async () => {
  console.log('[notify-worker] started');
  for (;;) {
    try {
      const res = await cycleOnce();
      if (res) console.log(`[notify-worker] checked=${res.checked} sent=${res.sent} skipped=${res.skipped}`);
    } catch (e) {
      console.error('[notify-worker] error', e?.message);
    }
    await sleep(60 * 1000); // co minutę
  }
})();
