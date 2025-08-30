const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validators');
const requireAdmin = require('../middleware/requireAdmin');

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

// GET /api/locations – public
router.get('/', async (req, res, next) => {
  try {
    const lang = pickLang(req);
    const n = nameCol('l', lang);
    const d = descCol('l', lang);

    const { rows } = await pool.query(`
      SELECT l.id, ${n} AS name, l.type, l.lat, l.lng, ${d} AS description
      FROM locations l
      ORDER BY l.id ASC
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/locations – create (admin)
router.post('/',
  requireAdmin,
  [
    body('name').optional().isLength({ min: 2 }),
    body('name_pl').optional().isString(),
    body('name_en').optional().isString(),
    body('type').isString(),
    body('lat').isFloat(),
    body('lng').isFloat(),
    body('description').optional().isString(),
    body('description_pl').optional().isString(),
    body('description_en').optional().isString(),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const {
        name, name_pl, name_en,
        type, lat, lng,
        description, description_pl, description_en
      } = req.body;

      const baseName = name || name_pl || name_en;
      const baseDesc = description || description_pl || description_en;

      const { rows } = await pool.query(`
        INSERT INTO locations (name, type, lat, lng, description, name_pl, name_en, description_pl, description_en)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
      `, [
        baseName || 'Point',
        type, Number(lat), Number(lng),
        baseDesc || '',
        name_pl || null, name_en || null,
        description_pl || null, description_en || null
      ]);
      res.status(201).json(rows[0]);
    } catch (e) { next(e); }
  }
);

// PUT /api/locations/:id – update (admin)
router.put('/:id',
  requireAdmin,
  [
    body('name').optional().isLength({ min: 2 }),
    body('name_pl').optional().isString(),
    body('name_en').optional().isString(),
    body('type').optional().isString(),
    body('lat').optional().isFloat(),
    body('lng').optional().isFloat(),
    body('description').optional().isString(),
    body('description_pl').optional().isString(),
    body('description_en').optional().isString(),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        name, name_pl, name_en,
        type, lat, lng,
        description, description_pl, description_en
      } = req.body;

      const { rows } = await pool.query(`
        UPDATE locations SET
          name = COALESCE($2, name),
          type = COALESCE($3, type),
          lat = COALESCE($4, lat),
          lng = COALESCE($5, lng),
          description = COALESCE($6, description),
          name_pl = COALESCE($7, name_pl),
          name_en = COALESCE($8, name_en),
          description_pl = COALESCE($9, description_pl),
          description_en = COALESCE($10, description_en)
        WHERE id=$1
        RETURNING *
      `, [
        id,
        name || null, type || null,
        lat !== undefined ? Number(lat) : null,
        lng !== undefined ? Number(lng) : null,
        description || null,
        name_pl || null, name_en || null,
        description_pl || null, description_en || null
      ]);

      if (!rows[0]) return res.status(404).json({ error: 'not_found' });
      res.json(rows[0]);
    } catch (e) { next(e); }
  }
);

// DELETE /api/locations/:id – remove (admin)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const r = await pool.query('DELETE FROM locations WHERE id=$1', [id]);
    if (!r.rowCount) return res.status(404).json({ error: 'not_found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
