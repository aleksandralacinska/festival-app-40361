const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validators');
const requireAdmin = require('../middleware/requireAdmin');

// Dozwolone kategorie
const PUBLIC_CATS = ['concert', 'parade', 'ceremony', 'special'];
const TEAM_CATS = ['concert', 'special', 'party', 'meal', 'rehearsal', 'other'];

// GET /api/events – lista publiczna
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.id, e.name, e.description, e.start_time, e.end_time, e.category,
             l.name AS location_name, e.location_id, e.team_id, e.is_public
      FROM events e
      LEFT JOIN locations l ON l.id = e.location_id
      WHERE e.is_public IS DISTINCT FROM FALSE
      ORDER BY e.start_time ASC
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/events – create (admin)
router.post('/',
  requireAdmin,
  [
    body('name').trim().isLength({ min: 3 }),
    body('start_time').isISO8601(),
    body('end_time').optional({ nullable: true }).isISO8601(),
    body('category').isString(),
    body('location_id').optional({ nullable: true }).isInt(),
    body('team_id').optional({ nullable: true }).isInt(),
    body('is_public').optional({ nullable: true }).isBoolean(),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      let { name, description, start_time, end_time, category, location_id, team_id, is_public } = req.body;

      // Normalizacja
      category = String(category);
      const isTeam = !!team_id;

      // Walidacja kategorii względem trybu
      if (isTeam) {
        if (!TEAM_CATS.includes(category)) {
          return res.status(400).json({ error: 'invalid_category_for_team' });
        }
        is_public = false; // wydarzenia zespołu nie są publiczne
      } else {
        if (!PUBLIC_CATS.includes(category)) {
          return res.status(400).json({ error: 'invalid_category_for_public' });
        }
        is_public = true; // ogólny harmonogram jest publiczny
      }

      const { rows } = await pool.query(
        `INSERT INTO events (name, description, start_time, end_time, category, location_id, team_id, is_public)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [name, description || null, start_time, end_time || null, category,
         location_id || null, team_id || null, is_public]
      );
      res.status(201).json(rows[0]);
    } catch (e) { next(e); }
  }
);

// PUT /api/events/:id – update (admin)
router.put('/:id',
  requireAdmin,
  [
    body('name').optional().isLength({ min: 3 }),
    body('start_time').optional().isISO8601(),
    body('end_time').optional({ nullable: true }).isISO8601(),
    body('category').optional().isString(),
    body('location_id').optional({ nullable: true }).isInt(),
    body('team_id').optional({ nullable: true }).isInt(),
    body('is_public').optional({ nullable: true }).isBoolean(),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const existing = await pool.query('SELECT id, team_id, category FROM events WHERE id=$1', [id]);
      const ev = existing.rows[0];
      if (!ev) return res.status(404).json({ error: 'not_found' });

      // Jeśli zmieniamy kategorię albo widoczność, sprawdź zasady
      let { name, description, start_time, end_time, category, location_id, team_id, is_public } = req.body;

      const newTeamId = (team_id !== undefined ? team_id : ev.team_id);
      const newCategory = (category !== undefined ? category : ev.category);

      if (newTeamId) {
        if (newCategory && !TEAM_CATS.includes(newCategory)) {
          return res.status(400).json({ error: 'invalid_category_for_team' });
        }
        if (is_public === true) {
          return res.status(400).json({ error: 'team_events_cannot_be_public' });
        }
      } else {
        if (newCategory && !PUBLIC_CATS.includes(newCategory)) {
          return res.status(400).json({ error: 'invalid_category_for_public' });
        }
        if (is_public === false) {
          return res.status(400).json({ error: 'public_events_must_be_public' });
        }
      }

      const { rows } = await pool.query(
        `UPDATE events SET
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           start_time = COALESCE($4, start_time),
           end_time = COALESCE($5, end_time),
           category = COALESCE($6, category),
           location_id = COALESCE($7, location_id),
           team_id = COALESCE($8, team_id),
           is_public = COALESCE($9, is_public)
         WHERE id=$1
         RETURNING *`,
        [id, name || null, description || null, start_time || null, end_time || null,
         category || null, location_id || null, team_id || null, (is_public !== undefined ? is_public : null)]
      );
      if (!rows[0]) return res.status(404).json({ error: 'not_found' });
      res.json(rows[0]);
    } catch (e) { next(e); }
  }
);

module.exports = router;
