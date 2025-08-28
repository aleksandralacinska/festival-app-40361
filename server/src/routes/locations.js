const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validators');
const requireAdmin = require('../middleware/requireAdmin');

// GET /api/locations
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM locations ORDER BY name ASC');
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/locations – create (admin)
router.post('/',
  requireAdmin,
  [
    body('name').trim().isLength({ min: 2 }),
    body('type').trim().isIn(['stage','hotel','info','parade','rehearsal','attraction','other']),
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
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [name, type, lat, lng, description || null]
      );
      res.status(201).json(rows[0]);
    } catch (e) { next(e); }
  }
);

module.exports = router;
