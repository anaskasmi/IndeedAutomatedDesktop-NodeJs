//packages
const express = require('express');
const applyMethodsSetsController = require('../../../controller/description-builder/applyMethods/sets.controller');
const router = express.Router();

router.get('/:id', applyMethodsSetsController.findOne)
router.get('/', applyMethodsSetsController.findAll)
router.post('/', applyMethodsSetsController.create)
router.post('/add-item/:id', applyMethodsSetsController.addItem)
router.post('/remove-item/:id', applyMethodsSetsController.removeItem)
router.patch('/:id', applyMethodsSetsController.update)
router.delete('/:id', applyMethodsSetsController.delete)

module.exports = router;