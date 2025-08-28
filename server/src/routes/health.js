const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'festival-api',
    time: new Date().toISOString(),
  });
});

module.exports = router;
