const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');
const router = express.Router();

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ dateAdded: -1 });
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new recipe
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      prepTime,
      cookTime,
      servings,
      ingredients,
      steps,
      tags,
      cuisineType,
      mealType,
      difficulty,
    } = req.body;
    
    // Parse JSON strings if needed
    const parsedIngredients = ingredients && typeof ingredients === 'string' 
      ? JSON.parse(ingredients) 
      : ingredients;
    
    const parsedSteps = steps && typeof steps === 'string'
      ? JSON.parse(steps)
      : steps;
    
    const parsedTags = tags && typeof tags === 'string'
      ? JSON.parse(tags)
      : tags;
    
    // Create new recipe
    const newRecipe = new Recipe({
      title,
      description,
      prepTime: parseInt(prepTime) || 0,
      cookTime: parseInt(cookTime) || 0,
      servings: parseInt(servings) || 1,
      ingredients: parsedIngredients,
      steps: parsedSteps,
      tags: parsedTags,
      cuisineType,
      mealType,
      difficulty,
      createdBy: req.user.id,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
    
    const recipe = await newRecipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update recipe
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      prepTime,
      cookTime,
      servings,
      ingredients,
      steps,
      tags,
      cuisineType,
      mealType,
      difficulty,
    } = req.body;
    
    // Parse JSON strings if needed
    const parsedIngredients = ingredients && typeof ingredients === 'string' 
      ? JSON.parse(ingredients) 
      : ingredients;
    
    const parsedSteps = steps && typeof steps === 'string'
      ? JSON.parse(steps)
      : steps;
    
    const parsedTags = tags && typeof tags === 'string'
      ? JSON.parse(tags)
      : tags;
    
    // Build recipe update object
    const recipeFields = {
      title,
      description,
      prepTime: parseInt(prepTime) || 0,
      cookTime: parseInt(cookTime) || 0,
      servings: parseInt(servings) || 1,
      ingredients: parsedIngredients,
      steps: parsedSteps,
      tags: parsedTags,
      cuisineType,
      mealType,
      difficulty
    };
    
    if (req.file) {
      recipeFields.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    // Find recipe and check ownership
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Make sure user owns recipe
    if (recipe.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this recipe' });
    }
    
    // Update recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $set: recipeFields },
      { new: true }
    );
    
    res.json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete recipe
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check ownership
    if (recipe.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this recipe' });
    }
    
    // Delete image if exists
    if (recipe.imageUrl) {
      const imagePath = path.join(__dirname, '..', recipe.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await recipe.remove();
    res.json({ message: 'Recipe removed' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark recipe as made
router.post('/:id/made', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Add today's date to datesMade array
    recipe.datesMade.push(new Date());
    await recipe.save();
    
    res.json(recipe);
  } catch (error) {
    console.error('Error marking recipe as made:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to recipe
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const { text } = req.body;
    
    recipe.comments.push({
      text,
      date: new Date()
    });
    
    await recipe.save();
    res.json(recipe.comments);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add step note
router.post('/:id/steps/:stepIndex/notes', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const { text } = req.body;
    const stepIndex = req.params.stepIndex;
    
    // If no existing notes for this step
    if (!recipe.stepNotes) {
      recipe.stepNotes = new Map();
    }
    
    const stepNotes = recipe.stepNotes.get(stepIndex) || [];
    stepNotes.push({
      text,
      date: new Date()
    });
    
    recipe.stepNotes.set(stepIndex, stepNotes);
    await recipe.save();
    
    res.json(recipe.stepNotes.get(stepIndex));
  } catch (error) {
    console.error('Error adding step note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search recipes
router.get('/search/:query', async (req, res) => {
  try {
    const recipes = await Recipe.find({
      $text: { $search: req.params.query }
    });
    
    res.json(recipes);
  } catch (error) {
    console.error('Error searching recipes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;