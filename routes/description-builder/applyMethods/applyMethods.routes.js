const express = require('express');
const router = express.Router();

router.use('/items', require('./items.routes'));
router.use('/sets', require('./sets.routes'));

module.exports = router;