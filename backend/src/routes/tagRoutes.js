// src/routes/tagRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const TagUtils = require('../utils/tagUtils');
const { supabase } = require('../config/supabase');

// All tag routes require authentication
router.use(authMiddleware);

// Get popular tags
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const popularTags = await TagUtils.getPopularTags(limit);
    res.json(popularTags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search tags (for autocomplete)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const tags = await TagUtils.searchTags(q);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's tags
router.get('/my-tags', async (req, res) => {
  try {
    const userId = req.user.id;
    const userTags = await TagUtils.getUserTags(userId);
    res.json(userTags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Suggest tags for a recipe
router.post('/suggest', async (req, res) => {
  try {
    const recipeData = req.body;
    const suggestions = TagUtils.suggestTags(recipeData);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tags (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { data: tags, error, count } = await supabase
      .from('tags')
      .select('*', { count: 'exact' })
      .order('name')
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      tags,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
