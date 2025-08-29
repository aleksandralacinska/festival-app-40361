const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const requireAdmin = require('../middleware/requireAdmin');
const bcrypt = require('bcrypt');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validators');
const jwt = require('jsonwebtoken');

// GET /api/teams – lista (admin)
router.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id, name, slug, country FROM teams ORDER BY name ASC');
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/teams – utwórz zespół (admin)
router.post('/',
  requireAdmin,
  [
    body('name').trim().isLength({ min: 3 }),
    body('slug').trim().matches(/^[a-z0-9-]{2,60}$/),
    body('country').optional({ nullable: true }).isString(),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const { name, slug, country } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO teams (name, slug, country)
         VALUES ($1,$2,$3)
         RETURNING id, name, slug, country`,
        [name, slug, country || null]
      );
      res.status(201).json(rows[0]);
    } catch (e) {
      if (e.code === '23505') {
        return res.status(409).json({ error: 'slug_taken' });
      }
      next(e);
    }
  }
);

// PATCH /api/teams/:id/pin – ustaw PIN (admin)
router.patch('/:id/pin',
  requireAdmin,
  [
    body('pin').trim().isLength({ min: 4, max: 12 }).matches(/^[0-9]+$/),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { pin } = req.body;
      const hash = await bcrypt.hash(String(pin), 10);
      const r = await pool.query('UPDATE teams SET pin_hash=$1 WHERE id=$2', [hash, id]);
      if (!r.rowCount) return res.status(404).json({ error: 'not_found' });
      res.json({ ok: true });
    } catch (e) { next(e); }
  }
);

// === Guard zespołu (dla /api/team/me) ===
function requireTeam(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.teamId) return res.status(403).json({ error: 'forbidden' });
    req.teamId = payload.teamId;
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

// GET /api/team/me
router.get('/me', requireTeam, async (req, res) => {
  try {
    const { rows: trows } = await pool.query(
      'SELECT id, name, slug FROM teams WHERE id=$1 LIMIT 1',
      [req.teamId]
    );
    const team = trows[0];
    if (!team) return res.status(404).json({ error: 'not_found' });

    const { rows: evs } = await pool.query(`
      SELECT e.id, e.name, e.description, e.start_time, e.end_time, e.category,
             l.name AS location_name
      FROM events e
      LEFT JOIN locations l ON l.id = e.location_id
      WHERE e.team_id = $1
      ORDER BY e.start_time ASC
    `, [team.id]);

    const { rows: lodge } = await pool.query(
      `SELECT id, name, description FROM locations WHERE type='hotel' ORDER BY id LIMIT 1`
    );

    res.json({
      team,
      events: evs,
      lodging: lodge[0] || null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'team_me_failed' });
  }
});

module.exports = router;
