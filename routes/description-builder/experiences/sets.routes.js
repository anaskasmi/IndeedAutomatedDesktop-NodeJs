//packages
const express = require('express');
const experiencesSetsController = require('../../../controller/description-builder/experiences/sets.controller');
const router = express.Router();

router.get('/:id', experiencesSetsController.findOne)
router.get('/', experiencesSetsController.findAll)
router.post('/', experiencesSetsController.create)
router.post('/add-item/:id', experiencesSetsController.addItem)
router.post('/remove-item/:id', experiencesSetsController.removeItem)
router.patch('/:id', experiencesSetsController.update)
router.delete('/:id', experiencesSetsController.delete)

module.exports = router;