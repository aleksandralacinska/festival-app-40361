const express = require('express');
const router = express.Router();

router.use('/events', require('./events'));
router.use('/locations', require('./locations'));

module.exports = router;
