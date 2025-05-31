// src/routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { authMiddleware } = require('../middleware/auth');

// All recipe routes require authentication
router.use(authMiddleware);

router.get('/filters', (req, res) => {
  res.json({
    cuisineTypes: [
      'italian', 'mexican', 'chinese', 'indian', 'american', 
      'french', 'thai', 'japanese', 'mediterranean', 'middle-eastern', 
      'greek', 'korean', 'vietnamese', 'other'
    ],
    mealTypes: [
      'breakfast', 'lunch', 'dinner', 'dessert', 'snack', 
      'appetizer', 'side dish', 'drink', 'sauce', 'other'
    ],
    difficulties: ['easy', 'medium', 'hard'],
    tags: [] // Empty for now
  });
});

// Recipe CRUD operations
router.get('/', recipeController.getAllRecipes);
router.get('/:id', recipeController.getRecipe);
router.post('/', recipeController.createRecipe);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);

// Recipe interactions
router.post('/:id/make', recipeController.recordMake);
router.get('/:id/history', recipeController.getRecipeHistory);

module.exports = router;