import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get all recipes
export const getRecipes = createAsyncThunk(
  'recipes/getRecipes',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/recipes');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Failed to fetch recipes');
    }
  }
);

// Get recipe by ID
export const getRecipeById = createAsyncThunk(
  'recipes/getRecipeById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/recipes/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Failed to fetch recipe');
    }
  }
);

// Create recipe
export const createRecipe = createAsyncThunk(
  'recipes/createRecipe',
  async (formData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      };
      
      const res = await axios.post('/api/recipes', formData, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Failed to create recipe');
    }
  }
);

// Update recipe
export const updateRecipe = createAsyncThunk(
  'recipes/updateRecipe',
  async ({ id, formData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      };
      
      const res = await axios.put(`/api/recipes/${id}`, formData, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Failed to update recipe');
    }
  }
);

// Delete recipe
export const deleteRecipe = createAsyncThunk(
  'recipes/deleteRecipe',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      
      await axios.delete(`/api/recipes/${id}`, config);
      return id;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Failed to delete recipe');
    }
  }
);

// Mark recipe as made
export const markRecipeAsMade = createAsyncThunk(
  'recipes/markRecipeAsMade',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      
      const res = await axios.post(`/api/recipes/${id}/made`, {}, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Failed to mark recipe as made');
    }
  }
);

// Add comment to recipe
export const addComment = createAsyncThunk(
  'recipes/addComment',
  async ({ id, text }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      const res = await axios.post(`/api/recipes/${id}/comments`, { text }, config);
      return { id, comments: res.data };
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Failed to add comment');
    }
  }
);

// Add step note
export const addStepNote = createAsyncThunk(
  'recipes/addStepNote',
  async ({ id, stepIndex, text }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      const res = await axios.post(
        `/api/recipes/${id}/steps/${stepIndex}/notes`, 
        { text }, 
        config
      );
      
      return { id, stepIndex, notes: res.data };
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Failed to add step note');
    }
  }
);

// Search recipes
export const searchRecipes = createAsyncThunk(
  'recipes/searchRecipes',
  async (query, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/recipes/search/${query}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Failed to search recipes');
    }
  }
);

const recipeSlice = createSlice({
  name: 'recipes',
  initialState: {
    recipes: [],
    recipe: null,
    loading: false,
    error: null,
    filtered: [],
    success: false
  },
  reducers: {
    clearCurrentRecipe: (state) => {
      state.recipe = null;
    },
    clearRecipeError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all recipes
      .addCase(getRecipes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = action.payload;
      })
      .addCase(getRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get recipe by ID
      .addCase(getRecipeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecipeById.fulfilled, (state, action) => {
        state.loading = false;
        state.recipe = action.payload;
      })
      .addCase(getRecipeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create recipe
      .addCase(createRecipe.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = [action.payload, ...state.recipes];
        state.success = true;
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update recipe
      .addCase(updateRecipe.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = state.recipes.map(recipe =>
          recipe._id === action.payload._id ? action.payload : recipe
        );
        state.recipe = action.payload;
        state.success = true;
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete recipe
      .addCase(deleteRecipe.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = state.recipes.filter(
          recipe => recipe._id !== action.payload
        );
        state.recipe = null;
        state.success = true;
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark recipe as made
      .addCase(markRecipeAsMade.fulfilled, (state, action) => {
        state.recipe = action.payload;
        state.recipes = state.recipes.map(recipe =>
          recipe._id === action.payload._id ? action.payload : recipe
        );
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.recipe && state.recipe._id === action.payload.id) {
          state.recipe.comments = action.payload.comments;
        }
      })
      // Add step note
      .addCase(addStepNote.fulfilled, (state, action) => {
        if (state.recipe && state.recipe._id === action.payload.id) {
          if (!state.recipe.stepNotes) {
            state.recipe.stepNotes = {};
          }
          state.recipe.stepNotes[action.payload.stepIndex] = action.payload.notes;
        }
      })
      // Search recipes
      .addCase(searchRecipes.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.filtered = action.payload;
      })
      .addCase(searchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentRecipe, clearRecipeError, clearSuccess } = recipeSlice.actions;
export default recipeSlice.reducer;