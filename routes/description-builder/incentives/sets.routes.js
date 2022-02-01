//packages
const express = require('express');
const incentivesSetsController = require('../../../controller/description-builder/incentives/sets.controller');
const router = express.Router();

router.get('/:id', incentivesSetsController.findOne)
router.get('/', incentivesSetsController.findAll)
router.post('/', incentivesSetsController.create)
router.post('/add-item/:id', incentivesSetsController.addItem)
router.post('/remove-item/:id', incentivesSetsController.removeItem)
router.patch('/:id', incentivesSetsController.update)
router.delete('/:id', incentivesSetsController.delete)

module.exports = router;