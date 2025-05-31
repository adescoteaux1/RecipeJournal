// src/controllers/recipeController.js
const { supabase } = require('../config/supabase');

class RecipeController {
  // Get all recipes with filtering
  // async getAllRecipes(req, res) {
  //   try {
  //     const userId = req.user.id;
  //     const { 
  //       cuisine_type, 
  //       meal_type, 
  //       difficulty, 
  //       tags,
  //       search 
  //     } = req.query;

  //     // Build the query
  //     let query = supabase
  //       .from('recipes')
  //       .select(`
  //         *,
  //         recipe_images!inner (
  //           image_url,
  //           is_primary
  //         ),
  //         recipe_tags (
  //           tag:tags (
  //             id,
  //             name
  //           )
  //         )
  //       `)
  //       .eq('user_id', userId);

  //     // Apply filters
  //     if (cuisine_type) {
  //       query = query.eq('cuisine_type', cuisine_type);
  //     }
  //     if (meal_type) {
  //       query = query.eq('meal_type', meal_type);
  //     }
  //     if (difficulty) {
  //       query = query.eq('difficulty', difficulty);
  //     }
  //     if (search) {
  //       query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  //     }

  //     // Filter by tags if provided
  //     if (tags) {
  //       const tagArray = Array.isArray(tags) ? tags : [tags];
  //       const recipeIds = await this.getRecipeIdsByTagsEfficient(tagArray, userId);
  //       if (recipeIds.length > 0) {
  //         query = query.in('id', recipeIds);
  //       } else {
  //         // No recipes match the tags
  //         return res.json([]);
  //       }
  //     }

  //     const { data: recipes, error } = await query
  //       .order('created_at', { ascending: false });

  //     if (error) throw error;

  //     // Transform tags for easier use
  //     const recipesWithTags = recipes.map(recipe => ({
  //       ...recipe,
  //       tags: recipe.recipe_tags ? recipe.recipe_tags.map(rt => rt.tag.name) : []
  //     }));

  //     res.json(recipesWithTags);
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // }
  async getAllRecipes(req, res) {
    try {
      const userId = req.user.id;
      console.log('Getting recipes for user:', userId);

      // First, test without any joins
      const { data: testRecipes, error: testError } = await supabase
        .from('recipes')
        .select('id, title, user_id')
        .eq('user_id', userId);

      console.log('Test query result:', { 
        count: testRecipes?.length, 
        error: testError,
        userId 
      });

      // Your original query...
      let query = supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId);

      const { data: recipes, error } = await query
        .order('created_at', { ascending: false });

      console.log('Final query result:', { 
        count: recipes?.length, 
        error,
        firstRecipe: recipes?.[0]
      });

      if (error) throw error;

      res.json(recipes || []);
    } catch (error) {
      console.error('Error in getAllRecipes:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get single recipe with all details
  async getRecipe(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { data: recipe, error } = await supabase
        .from('recipes')
        .select(`
          *,
          ingredients (
            id,
            text,
            amount,
            unit,
            item,
            order_index
          ),
          instructions (
            id,
            step_number,
            text,
            instruction_notes (
              id,
              note,
              created_at,
              user:auth.users (
                id,
                email
              )
            )
          ),
          recipe_images (
            id,
            image_url,
            caption,
            is_primary
          ),
          recipe_makes (
            id,
            made_at,
            rating,
            notes
          ),
          recipe_comments (
            id,
            comment,
            created_at,
            user:auth.users (
              id,
              email
            )
          ),
          recipe_tags (
            tag:tags (
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Sort ingredients and instructions
      recipe.ingredients.sort((a, b) => a.order_index - b.order_index);
      recipe.instructions.sort((a, b) => a.step_number - b.step_number);
      
      // Flatten tags
      recipe.tags = recipe.recipe_tags ? recipe.recipe_tags.map(rt => rt.tag.name) : [];

      res.json(recipe);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new recipe
  async createRecipe(req, res) {
    try {
      const userId = req.user.id;
      const { 
        title, 
        description, 
        prep_time, 
        cook_time, 
        servings,
        source_url,
        ingredients,
        instructions,
        header_image_url,
        cuisine_type,
        meal_type,
        difficulty,
        tags
      } = req.body;

      // Create the recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          user_id: userId,
          title,
          description,
          prep_time,
          cook_time,
          servings,
          source_url,
          header_image_url,
          cuisine_type: cuisine_type || 'other',
          meal_type: meal_type || 'other',
          difficulty: difficulty || 'medium'
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Insert ingredients
      if (ingredients && ingredients.length > 0) {
        const ingredientsData = ingredients.map((ing, index) => ({
          recipe_id: recipe.id,
          text: ing.text,
          amount: ing.amount,
          unit: ing.unit,
          item: ing.item,
          order_index: ing.order_index || index
        }));

        const { error: ingError } = await supabase
          .from('ingredients')
          .insert(ingredientsData);

        if (ingError) throw ingError;
      }

      // Insert instructions
      if (instructions && instructions.length > 0) {
        const instructionsData = instructions.map((inst, index) => ({
          recipe_id: recipe.id,
          step_number: inst.step_number || index + 1,
          text: inst.text
        }));

        const { error: instError } = await supabase
          .from('instructions')
          .insert(instructionsData);

        if (instError) throw instError;
      }

      // Handle tags
      if (tags && tags.length > 0) {
        await this.addTagsToRecipe(recipe.id, tags);
      }

      // Log creation in edit history
      await this.logEdit(recipe.id, userId, 'created', null, 'Recipe created');

      res.status(201).json({ 
        message: 'Recipe created successfully', 
        recipe 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update recipe
  async updateRecipe(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      // Get current recipe for comparison
      const { data: currentRecipe, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError || !currentRecipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Track changes for edit history
      const changes = [];
      const recipeFields = ['title', 'description', 'prep_time', 'cook_time', 'servings', 'cuisine_type', 'meal_type', 'difficulty'];
      
      recipeFields.forEach(field => {
        if (updates[field] !== undefined && updates[field] !== currentRecipe[field]) {
          changes.push({
            field,
            old_value: currentRecipe[field],
            new_value: updates[field]
          });
        }
      });

      // Update recipe
      const { data: updatedRecipe, error: updateError } = await supabase
        .from('recipes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log changes to edit history
      for (const change of changes) {
        await this.logEdit(id, userId, change.field, change.old_value, change.new_value);
      }

      // Handle ingredient updates if provided
      if (updates.ingredients) {
        await supabase
          .from('ingredients')
          .delete()
          .eq('recipe_id', id);

        const ingredientsData = updates.ingredients.map((ing, index) => ({
          recipe_id: id,
          text: ing.text,
          amount: ing.amount,
          unit: ing.unit,
          item: ing.item,
          order_index: ing.order_index || index
        }));

        await supabase
          .from('ingredients')
          .insert(ingredientsData);

        await this.logEdit(id, userId, 'ingredients', 'Updated', 'Updated');
      }

      // Handle instruction updates if provided
      if (updates.instructions) {
        await supabase
          .from('instructions')
          .delete()
          .eq('recipe_id', id);

        const instructionsData = updates.instructions.map((inst, index) => ({
          recipe_id: id,
          step_number: inst.step_number || index + 1,
          text: inst.text
        }));

        await supabase
          .from('instructions')
          .insert(instructionsData);

        await this.logEdit(id, userId, 'instructions', 'Updated', 'Updated');
      }

      // Handle tag updates if provided
      if (updates.tags !== undefined) {
        // Delete existing tags
        await supabase
          .from('recipe_tags')
          .delete()
          .eq('recipe_id', id);

        // Add new tags
        if (updates.tags && updates.tags.length > 0) {
          await this.addTagsToRecipe(id, updates.tags);
        }

        await this.logEdit(id, userId, 'tags', 'Updated', 'Updated');
      }

      res.json({ 
        message: 'Recipe updated successfully', 
        recipe: updatedRecipe 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete recipe
  async deleteRecipe(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Record making a recipe
  async recordMake(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { rating, notes } = req.body;

      const { data, error } = await supabase
        .from('recipe_makes')
        .insert({
          recipe_id: id,
          user_id: userId,
          rating,
          notes,
          made_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ 
        message: 'Recipe make recorded successfully', 
        data 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get recipe history
  async getRecipeHistory(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify recipe ownership
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (recipeError || !recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Get edit history
      const { data: history, error } = await supabase
        .from('recipe_edits')
        .select(`
          *,
          user:auth.users (
            id,
            email
          )
        `)
        .eq('recipe_id', id)
        .order('edited_at', { ascending: false });

      if (error) throw error;

      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get filter options (for UI dropdowns)
  async getFilterOptions(req, res) {
    try {
      // Get all available tags
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('name')
        .order('name');

      if (tagsError) throw tagsError;

      // Return filter options
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
        tags: tags.map(t => t.name)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update tags for a recipe
  async updateRecipeTags(req, res) {
    try {
      const { id } = req.params;
      const { tags } = req.body;
      const userId = req.user.id;

      // Verify recipe ownership
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (recipeError || !recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Delete existing tags
      await supabase
        .from('recipe_tags')
        .delete()
        .eq('recipe_id', id);

      // Add new tags
      if (tags && tags.length > 0) {
        await this.addTagsToRecipe(id, tags);
      }

      res.json({ message: 'Tags updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Helper method to get or create a tag
  async getOrCreateTag(tagName) {
    try {
      const normalizedName = tagName.toLowerCase().trim();
      
      // First try to find existing tag
      let { data: existingTag, error: selectError } = await supabase
        .from('tags')
        .select('id')
        .eq('name', normalizedName)
        .single();
      
      if (existingTag) {
        return existingTag.id;
      }
      
      // If not found (404 error is expected), create new tag
      const { data: newTag, error: insertError } = await supabase
        .from('tags')
        .insert({ name: normalizedName })
        .select('id')
        .single();
      
      if (insertError) {
        // Handle race condition where tag was created by another request
        if (insertError.code === '23505') { // Unique violation
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', normalizedName)
            .single();
          return existingTag?.id;
        }
        throw insertError;
      }
      
      return newTag.id;
    } catch (error) {
      console.error('Error in getOrCreateTag:', error);
      return null;
    }
  }

  // Helper method to add tags to a recipe
  async addTagsToRecipe(recipeId, tagNames) {
    try {
      // Get or create tag IDs
      const tagPromises = tagNames
        .filter(name => name && name.trim()) // Filter out empty strings
        .map(tagName => this.getOrCreateTag(tagName));
      
      const tagIds = await Promise.all(tagPromises);
      const validTagIds = tagIds.filter(id => id !== null);

      // Create recipe-tag associations
      const recipeTags = validTagIds.map(tagId => ({
        recipe_id: recipeId,
        tag_id: tagId
      }));

      if (recipeTags.length > 0) {
        // Insert all at once, ignoring duplicates
        const { error } = await supabase
          .from('recipe_tags')
          .insert(recipeTags);
        
        if (error && error.code !== '23505') { // Ignore duplicate key errors
          throw error;
        }
      }
    } catch (error) {
      console.error('Error adding tags to recipe:', error);
    }
  }

  // Helper method to get recipe IDs that have all specified tags
  async getRecipeIdsByTagsEfficient(tagNames, userId) {
    try {
      // Get tag IDs
      const normalizedNames = tagNames.map(name => name.toLowerCase().trim());
      
      const { data: tags, error: tagError } = await supabase
        .from('tags')
        .select('id')
        .in('name', normalizedNames);

      if (tagError || !tags || tags.length !== tagNames.length) {
        return [];
      }
      
      const tagIds = tags.map(t => t.id);
      
      // Get recipes that have at least one of the tags
      const { data: recipesWithTags, error } = await supabase
        .from('recipe_tags')
        .select('recipe_id')
        .in('tag_id', tagIds);
        
      if (error || !recipesWithTags) return [];
      
      // Count occurrences of each recipe_id
      const recipeCounts = {};
      recipesWithTags.forEach(rt => {
        recipeCounts[rt.recipe_id] = (recipeCounts[rt.recipe_id] || 0) + 1;
      });
      
      // Filter recipes that have ALL tags (count equals number of tags)
      const recipesWithAllTags = Object.entries(recipeCounts)
        .filter(([recipeId, count]) => count === tagIds.length)
        .map(([recipeId]) => recipeId);
      
      // Verify these recipes belong to the user
      const { data: userRecipes, error: verifyError } = await supabase
        .from('recipes')
        .select('id')
        .eq('user_id', userId)
        .in('id', recipesWithAllTags);
        
      if (verifyError) throw verifyError;
      
      return userRecipes.map(r => r.id);
    } catch (error) {
      console.error('Error filtering by tags:', error);
      return [];
    }
  }

  // Helper method to log edits
  async logEdit(recipeId, userId, fieldChanged, oldValue, newValue) {
    try {
      await supabase
        .from('recipe_edits')
        .insert({
          recipe_id: recipeId,
          user_id: userId,
          field_changed: fieldChanged,
          old_value: oldValue ? String(oldValue) : null,
          new_value: newValue ? String(newValue) : null
        });
    } catch (error) {
      console.error('Error logging edit:', error);
    }
  }
}

module.exports = new RecipeController();