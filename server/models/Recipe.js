const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: String,
  prepTime: {
    type: Number,
    min: 0
  },
  cookTime: {
    type: Number,
    min: 0
  },
  servings: {
    type: Number,
    min: 1,
    default: 1
  },
  ingredients: [{
    name: {
      type: String,
      required: true
    },
    amount: String,
    unit: String
  }],
  steps: [String],
  tags: [String],
  cuisineType: {
    type: String,
    enum: ['italian', 'mexican', 'chinese', 'indian', 'american', 'french', 'thai', 'japanese', 'mediterranean', 'middle-eastern', 'greek', 'korean', 'vietnamese', 'other']
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'appetizer', 'side dish', 'drink', 'sauce', 'other']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  datesMade: [Date],
  comments: [{
    text: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  stepNotes: {
    type: Map,
    of: [{
      text: String,
      date: Date
    }]
  },
  images: [{
    url: String,
    date: Date,
    caption: String
  }],
  originalUrl: String
});

// Add text index for search
RecipeSchema.index({
  title: 'text',
  description: 'text',
  'ingredients.name': 'text'
});

module.exports = mongoose.model('Recipe', RecipeSchema);