//packages
const express = require('express');
const qualitiesSetsController = require('../../../controller/description-builder/qualities/sets.controller');
const router = express.Router();

router.get('/:id', qualitiesSetsController.findOne)
router.get('/', qualitiesSetsController.findAll)
router.post('/', qualitiesSetsController.create)
router.post('/add-item/:id', qualitiesSetsController.addItem)
router.post('/remove-item/:id', qualitiesSetsController.removeItem)
router.patch('/:id', qualitiesSetsController.update)
router.delete('/:id', qualitiesSetsController.delete)

module.exports = router;