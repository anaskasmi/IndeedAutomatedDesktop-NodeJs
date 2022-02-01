//packages
const express = require('express');
const applyMethodsItemsController = require('../../../controller/description-builder/applyMethods/items.controller');
const router = express.Router();

router.get('/', applyMethodsItemsController.findAll)
router.get('/:id', applyMethodsItemsController.findOne)
router.post('/', applyMethodsItemsController.create)
router.patch('/:id', applyMethodsItemsController.update)
router.delete('/:id', applyMethodsItemsController.delete)

module.exports = router;