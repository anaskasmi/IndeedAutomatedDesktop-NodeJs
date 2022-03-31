//packages
const express = require('express');
const experiencesItemsController = require('../../../controller/description-builder/experiences/items.controller');
const router = express.Router();

router.get('/', experiencesItemsController.findAll)
router.get('/populate', experiencesItemsController.populate)
router.get('/:id', experiencesItemsController.findOne)
router.post('/', experiencesItemsController.create)
router.patch('/:id', experiencesItemsController.update)
router.delete('/:id', experiencesItemsController.delete)

module.exports = router;