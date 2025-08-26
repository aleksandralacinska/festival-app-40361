const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /api/auth/pin { slug, pin }
router.post('/pin', async (req, res) => {
  const { slug, pin } = req.body || {};
  if (!slug || !pin) return res.status(400).json({ error: 'slug_and_pin_required' });

  try {
    const { rows } = await pool.query(
      'SELECT id, name, slug, pin_hash FROM teams WHERE slug = $1 LIMIT 1',
      [slug]
    );
    const team = rows[0];
    if (!team || !team.pin_hash) return res.status(401).json({ error: 'invalid_credentials' });

    const ok = await bcrypt.compare(String(pin), team.pin_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

    const token = jwt.sign({ teamId: team.id, role: 'team' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, team: { id: team.id, name: team.name, slug: team.slug } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'auth_failed' });
  }
});

module.exports = router;
