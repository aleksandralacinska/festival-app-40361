const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { user, pass } = req.body || {};
  if (user !== process.env.ADMIN_USER || pass !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: '1d', issuer: 'festival-api'
  });
  res.json({ token, expiresIn: 86400 });
});

module.exports = router;
