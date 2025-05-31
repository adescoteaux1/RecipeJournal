// src/utils/tagUtils.js
const { supabase } = require('../config/supabase');

class TagUtils {
  // Normalize tag name (lowercase, trimmed, spaces to hyphens)
  static normalizeTagName(tagName) {
    return tagName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, ''); // Remove special characters
  }

  // Get popular tags with usage count
  static async getPopularTags(limit = 20) {
    try {
      // Get tag usage counts
      const { data: tagUsage, error } = await supabase
        .from('recipe_tags')
        .select('tag_id')
        .limit(1000); // Get a sample for counting

      if (error) throw error;

      // Count occurrences
      const tagCounts = {};
      tagUsage.forEach(item => {
        tagCounts[item.tag_id] = (tagCounts[item.tag_id] || 0) + 1;
      });

      // Get tag names
      const tagIds = Object.keys(tagCounts);
      const { data: tags, error: tagError } = await supabase
        .from('tags')
        .select('id, name')
        .in('id', tagIds);

      if (tagError) throw tagError;

      // Combine with counts and sort
      const popularTags = tags
        .map(tag => ({
          name: tag.name,
          count: tagCounts[tag.id]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return popularTags;
    } catch (error) {
      console.error('Error getting popular tags:', error);
      return [];
    }
  }

  // Search tags by partial name
  static async searchTags(searchTerm, limit = 10) {
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('name')
        .ilike('name', `%${searchTerm}%`)
        .limit(limit)
        .order('name');

      if (error) throw error;

      return tags.map(t => t.name);
    } catch (error) {
      console.error('Error searching tags:', error);
      return [];
    }
  }

  // Get all tags for a specific user's recipes
  static async getUserTags(userId) {
    try {
      // Get all recipe IDs for the user
      const { data: recipes, error: recipeError } = await supabase
        .from('recipes')
        .select('id')
        .eq('user_id', userId);

      if (recipeError) throw recipeError;

      const recipeIds = recipes.map(r => r.id);

      // Get all tags used in these recipes
      const { data: recipeTags, error: tagError } = await supabase
        .from('recipe_tags')
        .select('tag:tags(name)')
        .in('recipe_id', recipeIds);

      if (tagError) throw tagError;

      // Extract unique tag names
      const uniqueTags = [...new Set(recipeTags.map(rt => rt.tag.name))];
      return uniqueTags.sort();
    } catch (error) {
      console.error('Error getting user tags:', error);
      return [];
    }
  }

  // Suggest tags based on recipe content
  static suggestTags(recipe) {
    const suggestions = [];
    const { title = '', description = '', ingredients = [], instructions = [] } = recipe;
    
    // Combine all text
    const allText = [
      title,
      description,
      ...ingredients.map(i => i.text || ''),
      ...instructions.map(i => i.text || '')
    ].join(' ').toLowerCase();

    // Dietary tags
    const dietaryPatterns = {
      'vegetarian': /vegetarian|veggie|no meat|meatless/i,
      'vegan': /vegan|plant-based|no dairy/i,
      'gluten-free': /gluten[\s-]?free|no gluten|celiac/i,
      'dairy-free': /dairy[\s-]?free|no dairy|lactose[\s-]?free/i,
      'keto': /keto|low[\s-]?carb|ketogenic/i,
      'paleo': /paleo|whole30/i
    };

    // Cooking method tags
    const methodPatterns = {
      'baked': /bake|baking|oven/i,
      'grilled': /grill|bbq|barbecue/i,
      'fried': /fry|fried|pan-fry/i,
      'slow-cooker': /slow[\s-]?cook|crock[\s-]?pot/i,
      'instant-pot': /instant[\s-]?pot|pressure[\s-]?cook/i,
      'no-bake': /no[\s-]?bake|refrigerat/i,
      'one-pot': /one[\s-]?pot|single[\s-]?pot/i
    };

    // Time-based tags
    const timePatterns = {
      'quick': recipe.prep_time && recipe.prep_time <= 15,
      '30-minute': (recipe.prep_time || 0) + (recipe.cook_time || 0) <= 30,
      'make-ahead': /ahead|advance|refrigerat|freeze/i
    };

    // Check patterns
    Object.entries(dietaryPatterns).forEach(([tag, pattern]) => {
      if (pattern.test(allText)) suggestions.push(tag);
    });

    Object.entries(methodPatterns).forEach(([tag, pattern]) => {
      if (pattern.test(allText)) suggestions.push(tag);
    });

    Object.entries(timePatterns).forEach(([tag, condition]) => {
      if (typeof condition === 'boolean' ? condition : condition.test(allText)) {
        suggestions.push(tag);
      }
    });

    // Season tags
    const seasonPatterns = {
      'summer': /summer|bbq|grill|salad|cold|refresh/i,
      'winter': /winter|warm|comfort|soup|stew|hearty/i,
      'holiday': /holiday|christmas|thanksgiving|easter/i
    };

    Object.entries(seasonPatterns).forEach(([tag, pattern]) => {
      if (pattern.test(allText)) suggestions.push(tag);
    });

    return [...new Set(suggestions)]; // Remove duplicates
  }

  // Merge duplicate tags (admin function)
  static async mergeTags(oldTagName, newTagName) {
    try {
      // Get both tag IDs
      const { data: oldTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', oldTagName)
        .single();

      const { data: newTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', newTagName)
        .single();

      if (!oldTag || !newTag) {
        throw new Error('One or both tags not found');
      }

      // Update all recipe_tags to use the new tag
      const { error: updateError } = await supabase
        .from('recipe_tags')
        .update({ tag_id: newTag.id })
        .eq('tag_id', oldTag.id);

      if (updateError) throw updateError;

      // Delete the old tag
      const { error: deleteError } = await supabase
        .from('tags')
        .delete()
        .eq('id', oldTag.id);

      if (deleteError) throw deleteError;

      return { success: true, message: `Merged ${oldTagName} into ${newTagName}` };
    } catch (error) {
      console.error('Error merging tags:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = TagUtils;