//packages
const express = require('express');
const qualitiesItemsController = require('../../../controller/description-builder/qualities/items.controller');
const router = express.Router();

router.get('/', qualitiesItemsController.findAll)
router.get('/populate', qualitiesItemsController.populate)
router.get('/:id', qualitiesItemsController.findOne)
router.post('/', qualitiesItemsController.create)
router.patch('/:id', qualitiesItemsController.update)
router.delete('/:id', qualitiesItemsController.delete)

module.exports = router;