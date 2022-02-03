//packages
const express = require('express');
const incentivesItemsController = require('../../../controller/description-builder/incentives/items.controller');
const router = express.Router();

router.get('/', incentivesItemsController.findAll)
router.get('/:id', incentivesItemsController.findOne)
router.post('/', incentivesItemsController.create)
router.patch('/:id', incentivesItemsController.update)
router.delete('/:id', incentivesItemsController.delete)

module.exports = router;