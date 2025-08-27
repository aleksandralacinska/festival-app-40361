const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ error: 'validation_failed', details: errors.array() });
};

// Walidacja logowania PIN (slug + pin)
const pinLoginValidator = [
  body('slug')
    .trim()
    .isLength({ min: 2, max: 40 }).withMessage('slug_length')
    .matches(/^[a-z0-9-]+$/).withMessage('slug_format'),
  body('pin')
    .trim()
    .isLength({ min: 4, max: 12 }).withMessage('pin_length')
    .matches(/^[0-9]+$/).withMessage('pin_digits'),
  handleValidationErrors,
];

// Przykładowa walidacja /:id
const idParamValidator = [
  param('id').isInt({ gt: 0 }).withMessage('id_int'),
  handleValidationErrors,
];

module.exports = { pinLoginValidator, idParamValidator, handleValidationErrors };
