const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, type, lat, lng, description
       FROM locations
       ORDER BY name ASC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'locations_list_failed' });
  }
});

module.exports = router;
