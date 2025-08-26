const express = require('express');
const router = express.Router();

router.use('/events', require('./events'));
router.use('/locations', require('./locations'));
router.use('/auth', require('./auth'));
router.use('/team', require('./team'));

module.exports = router;
