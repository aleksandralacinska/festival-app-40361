const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/team/me  (wymaga Bearer JWT)
router.get('/me', auth, async (req, res) => {
  try {
    const teamId = req.user.teamId;

    const { rows: teamRows } = await pool.query(
      'SELECT id, name, country, lodging_location_id FROM teams WHERE id=$1',
      [teamId]
    );
    if (!teamRows.length) return res.status(404).json({ error: 'team_not_found' });
    const team = teamRows[0];

    const { rows: events } = await pool.query(
      `SELECT e.id, e.name, e.description, e.start_time, e.end_time,
              e.location_id, l.name as location_name
       FROM events e
       LEFT JOIN locations l ON l.id = e.location_id
       WHERE e.team_id=$1
       ORDER BY e.start_time ASC`,
      [teamId]
    );

    let lodging = null;
    if (team.lodging_location_id) {
      const { rows } = await pool.query(
        'SELECT id, name, type, lat, lng, description FROM locations WHERE id = $1',
        [team.lodging_location_id]
      );
      lodging = rows[0] || null;
    }

    res.json({ team, events, lodging });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'team_fetch_failed' });
  }
});

module.exports = router;
