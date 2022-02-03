//packages
const express = require('express');
const companiesController = require('../../../controller/description-builder/companies/companies.controller');
const router = express.Router();

router.get('/', companiesController.findAll);
router.post('/', companiesController.create);
router.patch('/:id', companiesController.update);
router.delete('/:id', companiesController.delete);

module.exports = router;