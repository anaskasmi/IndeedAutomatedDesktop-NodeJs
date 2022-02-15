//packages
const express = require('express');
const roleDescriptionsItemsController = require('../../../controller/description-builder/roleDescriptions/items.controller');
const router = express.Router();

router.get('/', roleDescriptionsItemsController.findAll)
router.get('/:id', roleDescriptionsItemsController.findOne)
router.post('/', roleDescriptionsItemsController.create)
router.patch('/:id', roleDescriptionsItemsController.update)
router.delete('/:id', roleDescriptionsItemsController.delete)

module.exports = router;