//packages
const express = require('express');
const compensationsItemsController = require('../../../controller/description-builder/compensations/items.controller');
const router = express.Router();

router.get('/populate', compensationsItemsController.populate)
router.get('/', compensationsItemsController.findAll)
router.get('/:id', compensationsItemsController.findOne)
router.post('/', compensationsItemsController.create)
router.patch('/:id', compensationsItemsController.update)
router.delete('/:id', compensationsItemsController.delete)

module.exports = router;