//packages
const express = require('express');
const positionsItemsController = require('../../../controller/description-builder/positions/items.controller');
const router = express.Router();

router.get('/', positionsItemsController.findAll)
router.get('/populate', positionsItemsController.populate)
router.get('/:id', positionsItemsController.findOne)
router.post('/', positionsItemsController.create)
router.patch('/:id', positionsItemsController.update)
router.delete('/:id', positionsItemsController.delete)

module.exports = router;