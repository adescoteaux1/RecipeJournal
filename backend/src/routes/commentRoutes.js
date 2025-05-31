// src/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

router.use(authMiddleware);

// Add comment to recipe
router.post('/recipes/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('recipe_comments')
      .insert({
        recipe_id: id,
        user_id: userId,
        comment
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recipe comments
router.get('/recipes/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('recipe_comments')
      .select(`
        *,
        user:auth.users (
          id,
          email
        )
      `)
      .eq('recipe_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add note to instruction
router.post('/instructions/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('instruction_notes')
      .insert({
        instruction_id: id,
        user_id: userId,
        note
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image to recipe
router.post('/recipes/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, caption, is_primary } = req.body;
    const userId = req.user.id;

    // If setting as primary, unset other primary images
    if (is_primary) {
      await supabase
        .from('recipe_images')
        .update({ is_primary: false })
        .eq('recipe_id', id);
    }

    const { data, error } = await supabase
      .from('recipe_images')
      .insert({
        recipe_id: id,
        user_id: userId,
        image_url,
        caption,
        is_primary
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;