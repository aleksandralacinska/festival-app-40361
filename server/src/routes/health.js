const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT now() as now');
    res.json({
      status: 'ok',
      service: 'festival-api',
      time: new Date().toISOString(),
      db: 'connected',
      db_now: rows[0]?.now
    });
  } catch (e) {
    console.error('[HEALTH] DB error:', e);
    res.status(500).json({
      status: 'fail',
      service: 'festival-api',
      time: new Date().toISOString(),
      db: 'error',
      error: e.message || String(e)
    });
  }
});

module.exports = router;
