const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validators');
const requireAdmin = require('../middleware/requireAdmin');
const { notifyEventCreate, notifyEventUpdate } = require('../services/pushService');

// Dozwolone kategorie
const PUBLIC_CATS = ['concert', 'parade', 'ceremony', 'special', 'fireworks'];
const TEAM_CATS = ['concert', 'special', 'party', 'meal', 'rehearsal', 'other'];

// wybór języka z query albo Accept-Language
function pickLang(req) {
  const q = String(req.query.lang || '').toLowerCase();
  if (q.startsWith('en')) return 'en';
  if (q.startsWith('pl')) return 'pl';
  const acc = String(req.headers['accept-language'] || '').toLowerCase();
  if (acc.includes('en')) return 'en';
  return 'pl';
}

function nameCol(alias, lang) {
  return lang === 'en'
    ? `COALESCE(${alias}.name_en, ${alias}.name)`
    : `COALESCE(${alias}.name_pl, ${alias}.name)`;
}
function descCol(alias, lang) {
  return lang === 'en'
    ? `COALESCE(${alias}.description_en, ${alias}.description)`
    : `COALESCE(${alias}.description_pl, ${alias}.description)`;
}

// GET /api/events – public (PWA)
router.get('/', async (req, res, next) => {
  try {
    const lang = pickLang(req);
    const n = nameCol('e', lang);
    const d = descCol('e', lang);

    const { rows } = await pool.query(`
      SELECT e.id,
             ${n} AS name,
             ${d} AS description,
             e.start_time, e.end_time, e.category,
             ${nameCol('l', lang)} AS location_name,
             e.location_id, e.team_id, e.is_public
      FROM events e
      LEFT JOIN locations l ON l.id = e.location_id
      WHERE e.is_public IS DISTINCT FROM FALSE
      ORDER BY e.start_time ASC
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/events/all – admin (pełne)
router.get('/all', requireAdmin, async (req, res, next) => {
  try {
    const lang = pickLang(req);
    const n = nameCol('e', lang);
    const d = descCol('e', lang);
    const ln = nameCol('l', lang);
    // UWAGA: teams nie mają i18n -> bierzemy zawsze t.name
    const tn = `t.name`;

    const { rows } = await pool.query(`
      SELECT e.*,
             ${n} AS name_i18n,
             ${d} AS description_i18n,
             ${ln} AS location_name,
             ${tn} AS team_name
      FROM events e
      LEFT JOIN locations l ON l.id = e.location_id
      LEFT JOIN teams t ON t.id = e.team_id
      ORDER BY e.start_time ASC NULLS LAST, e.id ASC
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/events – create (ADMIN)
router.post('/',
  requireAdmin,
  [
    body('name').optional().isLength({ min: 3 }),
    body('name_pl').optional().isLength({ min: 0 }),
    body('name_en').optional().isLength({ min: 0 }),
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
      let {
        name, name_pl, name_en,
        description, description_pl, description_en,
        start_time, end_time, category, location_id, team_id, is_public
      } = req.body;

      // walidacja kategorii wg typu eventu
      const isTeam = !!team_id;
      category = String(category);

      if (isTeam) {
        if (!TEAM_CATS.includes(category)) return res.status(400).json({ error: 'invalid_category_for_team' });
        is_public = false;
      } else {
        if (!PUBLIC_CATS.includes(category)) return res.status(400).json({ error: 'invalid_category_for_public' });
        is_public = true;
      }

      // fallback: jeśli nie podano name/description bazowych – weź PL/EN
      const baseName = name || name_pl || name_en;
      const baseDesc = description || description_pl || description_en;

      const { rows } = await pool.query(
        `INSERT INTO events
           (name, description, start_time, end_time, category, location_id, team_id, is_public,
            name_pl, name_en, description_pl, description_en)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [
          baseName || 'Untitled',
          baseDesc || '',
          start_time,
          end_time || null,
          category,
          location_id || null,
          team_id || null,
          is_public,
          name_pl || null,
          name_en || null,
          description_pl || null,
          description_en || null
        ]
      );

      const created = rows[0];

      // PUSH: utworzenie
      try { await notifyEventCreate(created); } catch {}

      res.status(201).json(created);
    } catch (e) { next(e); }
  }
);

// PUT /api/events/:id – update (ADMIN)
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
    // i18n pola
    body('name_pl').optional().isString(),
    body('name_en').optional().isString(),
    body('description_pl').optional().isString(),
    body('description_en').optional().isString(),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const id = req.params.id;

      const prevQ = await pool.query('SELECT * FROM events WHERE id=$1', [id]);
      const before = prevQ.rows[0];
      if (!before) return res.status(404).json({ error: 'not_found' });

      let {
        name, description, start_time, end_time, category,
        location_id, team_id, is_public,
        name_pl, name_en, description_pl, description_en
      } = req.body;

      const newTeamId = (team_id !== undefined ? team_id : before.team_id);
      const newCategory = (category !== undefined ? category : before.category);

      if (newTeamId) {
        if (newCategory && !TEAM_CATS.includes(newCategory)) return res.status(400).json({ error: 'invalid_category_for_team' });
        if (is_public === true) return res.status(400).json({ error: 'team_events_cannot_be_public' });
      } else {
        if (newCategory && !PUBLIC_CATS.includes(newCategory)) return res.status(400).json({ error: 'invalid_category_for_public' });
        if (is_public === false) return res.status(400).json({ error: 'public_events_must_be_public' });
      }

      const { rows } = await pool.query(
        `UPDATE events SET
           name            = COALESCE($2, name),
           description     = COALESCE($3, description),
           start_time      = COALESCE($4, start_time),
           end_time        = COALESCE($5, end_time),
           category        = COALESCE($6, category),
           location_id     = COALESCE($7, location_id),
           team_id         = COALESCE($8, team_id),
           is_public       = COALESCE($9, is_public),
           name_pl         = COALESCE($10, name_pl),
           name_en         = COALESCE($11, name_en),
           description_pl  = COALESCE($12, description_pl),
           description_en  = COALESCE($13, description_en)
         WHERE id=$1
         RETURNING *`,
        [
          id,
          name || null,
          description || null,
          start_time || null,
          end_time || null,
          category || null,
          location_id || null,
          team_id || null,
          (is_public !== undefined ? is_public : null),
          name_pl || null,
          name_en || null,
          description_pl || null,
          description_en || null
        ]
      );

      const after = rows[0];

      // PUSH: zmiana
      try { await notifyEventUpdate(before, after); } catch {}

      res.json(after);
    } catch (e) { next(e); }
  }
);

// DELETE /api/events/:id – delete (ADMIN)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const r = await pool.query('DELETE FROM events WHERE id=$1', [id]);
    if (!r.rowCount) return res.status(404).json({ error: 'not_found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
