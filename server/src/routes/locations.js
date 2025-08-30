const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validators');
const requireAdmin = require('../middleware/requireAdmin');

// GET public
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, type, lat, lng, description FROM locations ORDER BY id ASC`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// POST admin
router.post('/',
  requireAdmin,
  [
    body('name').trim().isLength({ min: 2 }),
    body('type').isIn(['stage','hotel','info','parade','rehearsal','attraction']),
    body('lat').isFloat({ min: -90, max: 90 }),
    body('lng').isFloat({ min: -180, max: 180 }),
    body('description').optional({ nullable: true }).isString(),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const { name, type, lat, lng, description } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO locations (name, type, lat, lng, description)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id, name, type, lat, lng, description`,
        [name, type, lat, lng, description || null]
      );
      res.status(201).json(rows[0]);
    } catch (e) { next(e); }
  }
);

// PUT admin
router.put('/:id',
  requireAdmin,
  [
    body('name').optional().trim().isLength({ min: 2 }),
    body('type').optional().isIn(['stage','hotel','info','parade','rehearsal','attraction']),
    body('lat').optional().isFloat({ min: -90, max: 90 }),
    body('lng').optional().isFloat({ min: -180, max: 180 }),
    body('description').optional({ nullable: true }).isString(),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, type, lat, lng, description } = req.body;
      const { rows } = await pool.query(
        `UPDATE locations SET
           name = COALESCE($2, name),
           type = COALESCE($3, type),
           lat = COALESCE($4, lat),
           lng = COALESCE($5, lng),
           description = COALESCE($6, description)
         WHERE id=$1
         RETURNING id, name, type, lat, lng, description`,
        [id, name || null, type || null, lat ?? null, lng ?? null, (description !== undefined ? description : null)]
      );
      if (!rows[0]) return res.status(404).json({ error: 'not_found' });
      res.json(rows[0]);
    } catch (e) { next(e); }
  }
);

// DELETE admin
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    // rozłącz wydarzenia z tą lokalizacją
    await pool.query('UPDATE events SET location_id=NULL WHERE location_id=$1', [id]);
    const r = await pool.query('DELETE FROM locations WHERE id=$1', [id]);
    if (!r.rowCount) return res.status(404).json({ error: 'not_found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
