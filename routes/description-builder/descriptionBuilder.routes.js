const express = require('express');
const router = express.Router();

router.use('/experiences', require('./experiences/experiences.routes'));
router.use('/positions', require('./positions/positions.routes'));
router.use('/compensations', require('./compensations/compensations.routes'));
router.use('/incentives', require('./incentives/incentives.routes'));
router.use('/applyMethods', require('./applyMethods/applyMethods.routes'));
router.use('/qualities', require('./qualities/qualities.routes'));
router.use('/companies', require('./companies/companies.routes'));
router.use('/postings', require('./postings/postings.routes'));
router.use('/roleDescriptions', require('./roleDescriptions/roleDescriptions.routes'));
router.use('/tags', require('./tags/tags.routes'));

module.exports = router;