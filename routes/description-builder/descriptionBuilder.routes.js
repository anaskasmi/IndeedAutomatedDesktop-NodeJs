const express = require('express');
const router = express.Router();

router.use('/experiences', require('./experiences/experiences.routes'));

module.exports = router;