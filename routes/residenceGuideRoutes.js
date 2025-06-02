// routes/residenceGuideRoutes.js
const express = require('express');
const router = express.Router();
const residenceGuideController = require('../controllers/residenceGuideController');

router.get('/', residenceGuideController.getAllGuides);
router.get('/:id', residenceGuideController.getGuide);
router.post('/', residenceGuideController.createGuide);
router.delete('/:id', residenceGuideController.delete);

module.exports = router;
