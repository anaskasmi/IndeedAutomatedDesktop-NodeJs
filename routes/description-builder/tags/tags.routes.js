//packages
const express = require('express');
const tagsItemsController = require('../../../controller/description-builder/tags/items.controller');
const router = express.Router();

router.get('/', tagsItemsController.findAll)
router.post('/', tagsItemsController.create)
router.patch('/:id', tagsItemsController.update)
router.delete('/:id', tagsItemsController.delete)

module.exports = router;