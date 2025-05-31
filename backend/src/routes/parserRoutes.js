// src/routes/parserRoutes.js
const express = require('express');
const router = express.Router();
const parserController = require('../controllers/parserController');
const { authMiddleware } = require('../middleware/auth');

// Parser routes require authentication
router.use(authMiddleware);

router.post('/parse-url', parserController.parseUrl);
router.post('/analyze-text', parserController.parseText);
router.post('/preview', parserController.previewRecipe);

module.exports = router;