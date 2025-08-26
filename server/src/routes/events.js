const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.id, e.name, e.description, e.start_time, e.end_time,
              e.location_id, l.name as location_name
       FROM events e
       LEFT JOIN locations l ON l.id = e.location_id
       ORDER BY e.start_time ASC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'events_list_failed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, l.name as location_name, l.lat, l.lng
       FROM events e
       LEFT JOIN locations l ON l.id = e.location_id
       WHERE e.id = $1`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'event_fetch_failed' });
  }
});

module.exports = router;
