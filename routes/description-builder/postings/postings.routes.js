//packages
const express = require('express');
const postingsController = require('../../../controller/description-builder/postings/postings.controller');
const router = express.Router();

router.get('/', postingsController.findAll);
router.post('/', postingsController.create);
router.patch('/:id', postingsController.update);
router.delete('/:id', postingsController.delete);

module.exports = router;