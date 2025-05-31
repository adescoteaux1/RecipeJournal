// src/controllers/parserController.js
const recipeParser = require('../services/recipeParser');

class ParserController {
  // Parse recipe from URL
  async parseUrl(req, res) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      // Parse the recipe
      const recipeData = await recipeParser.parseFromUrl(url);

      // Return parsed data for review before saving
      res.json({
        success: true,
        data: recipeData,
        message: 'Recipe parsed successfully. Review and edit before saving.'
      });
    } catch (error) {
      console.error('Recipe parsing error:', error);
      res.status(500).json({ 
        error: 'Failed to parse recipe',
        details: error.message 
      });
    }
  }

  // Parse recipe from pasted text
  async parseText(req, res) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text content is required' });
      }

      // Parse the recipe text
      const recipeData = recipeParser.parseFromText(text);

      // Validate that we got some meaningful data
      if (!recipeData.title && recipeData.ingredients.length === 0) {
        return res.status(422).json({ 
          error: 'Could not parse recipe from provided text',
          tip: 'Make sure your text includes a clear title, ingredients section, and instructions section'
        });
      }

      res.json({
        success: true,
        data: recipeData,
        message: 'Recipe parsed from text. Review and edit before saving.'
      });
    } catch (error) {
      console.error('Text parsing error:', error);
      res.status(500).json({ 
        error: 'Failed to parse recipe text',
        details: error.message 
      });
    }
  }

  // Preview parsed recipe (helper endpoint)
  async previewRecipe(req, res) {
    try {
      const { url, text } = req.body;

      let recipeData;
      if (url) {
        recipeData = await recipeParser.parseFromUrl(url);
      } else if (text) {
        recipeData = recipeParser.parseFromText(text);
      } else {
        return res.status(400).json({ 
          error: 'Either URL or text is required' 
        });
      }

      // Format for preview
      const preview = {
        title: recipeData.title,
        description: recipeData.description,
        timing: {
          prep: recipeData.prep_time ? `${recipeData.prep_time} minutes` : 'Not specified',
          cook: recipeData.cook_time ? `${recipeData.cook_time} minutes` : 'Not specified',
          total: recipeData.prep_time && recipeData.cook_time ? 
                 `${recipeData.prep_time + recipeData.cook_time} minutes` : 'Not specified'
        },
        servings: recipeData.servings || 'Not specified',
        ingredientCount: recipeData.ingredients.length,
        instructionCount: recipeData.instructions.length,
        hasImage: !!recipeData.header_image_url
      };

      res.json({
        preview,
        fullData: recipeData
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to generate preview',
        details: error.message 
      });
    }
  }
}

module.exports = new ParserController();