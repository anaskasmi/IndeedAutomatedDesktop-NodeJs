//packages
const express = require('express');
const compensationsSetsController = require('../../../controller/description-builder/compensations/sets.controller');
const router = express.Router();

router.get('/:id', compensationsSetsController.findOne)
router.get('/', compensationsSetsController.findAll)
router.post('/', compensationsSetsController.create)
router.post('/add-item/:id', compensationsSetsController.addItem)
router.post('/remove-item/:id', compensationsSetsController.removeItem)
router.patch('/:id', compensationsSetsController.update)
router.delete('/:id', compensationsSetsController.delete)

module.exports = router;