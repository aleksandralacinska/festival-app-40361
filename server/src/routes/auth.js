const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pinLoginValidator } = require('../middleware/validators');

// POST /api/auth/pin  { slug, pin }
router.post('/pin', pinLoginValidator, async (req, res, next) => {
  try {
    const slug = String(req.body.slug).toLowerCase();
    const pin = String(req.body.pin);

    const { rows } = await pool.query(
      'SELECT id, name, slug, pin_hash FROM teams WHERE slug = $1 LIMIT 1',
      [slug]
    );
    const team = rows[0];

    // Nie zdradzam, czy nie ma zespołu czy PIN zły
    if (!team || !team.pin_hash) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    const ok = await bcrypt.compare(pin, team.pin_hash);
    if (!ok) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    if (!process.env.JWT_SECRET) {
      const err = new Error('JWT_SECRET not configured');
      err.statusCode = 500;
      throw err;
    }

    const token = jwt.sign(
      { teamId: team.id, role: 'team' },
      process.env.JWT_SECRET,
      { expiresIn: '7d', issuer: 'festival-api' }
    );

    res.json({
      token,
      team: { id: team.id, name: team.name, slug: team.slug },
      expiresIn: 7 * 24 * 60 * 60 // sekundy (7 dni)
    });
  } catch (err) {
    next(err); // przechwyci globalny errorHandler
  }
});

module.exports = router;
