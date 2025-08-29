const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validators');
const requireAdmin = require('../middleware/requireAdmin');

// GET public – lista lokalizacji
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, type, lat, lng, description FROM locations ORDER BY id ASC`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// POST admin – dodaj lokalizację
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

module.exports = router;
