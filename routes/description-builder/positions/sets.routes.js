//packages
const express = require('express');
const positionsSetsController = require('../../../controller/description-builder/positions/sets.controller');
const router = express.Router();

router.get('/:id', positionsSetsController.findOne)
router.get('/', positionsSetsController.findAll)
router.post('/', positionsSetsController.create)
router.post('/add-item/:id', positionsSetsController.addItem)
router.post('/remove-item/:id', positionsSetsController.removeItem)
router.patch('/:id', positionsSetsController.update)
router.delete('/:id', positionsSetsController.delete)

module.exports = router;