// src/services/recipeService.ts
import api from './api';
import { Recipe, CreateRecipeData, RecipeFilters, FilterOptions } from '../types/recipe.types';

export const recipeService = {
  // Get all recipes with optional filters
  async getRecipes(filters?: RecipeFilters): Promise<Recipe[]> {
    const params = new URLSearchParams();
    
    if (filters?.cuisine_type) params.append('cuisine_type', filters.cuisine_type);
    if (filters?.meal_type) params.append('meal_type', filters.meal_type);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    const { data } = await api.get<Recipe[]>(`/api/recipes?${params.toString()}`);
    return data;
  },

  // Get single recipe
  async getRecipe(id: string): Promise<Recipe> {
    const { data } = await api.get<Recipe>(`/api/recipes/${id}`);
    return data;
  },

  // Create new recipe
  async createRecipe(recipe: CreateRecipeData): Promise<Recipe> {
    const { data } = await api.post<{ recipe: Recipe }>('/api/recipes', recipe);
    return data.recipe;
  },

  // Update recipe
  async updateRecipe(id: string, updates: Partial<CreateRecipeData>): Promise<Recipe> {
    const { data } = await api.put<{ recipe: Recipe }>(`/api/recipes/${id}`, updates);
    return data.recipe;
  },

  // Delete recipe
  async deleteRecipe(id: string): Promise<void> {
    await api.delete(`/api/recipes/${id}`);
  },

  // Get filter options
  async getFilterOptions(): Promise<FilterOptions> {
    const { data } = await api.get<FilterOptions>('/api/recipes/filters');
    return data;
  },

  // Record making a recipe
  async recordMake(id: string, rating?: number, notes?: string): Promise<void> {
    await api.post(`/api/recipes/${id}/make`, { rating, notes });
  },

  // Update recipe tags
  async updateTags(id: string, tags: string[]): Promise<void> {
    await api.put(`/api/recipes/${id}/tags`, { tags });
  },

  // Add comment to recipe
  async addComment(id: string, comment: string): Promise<void> {
    await api.post(`/api/recipes/${id}/comments`, { comment });
  },

  // Parse recipe from URL
  async parseFromUrl(url: string): Promise<any> {
    const { data } = await api.post('/api/parser/parse-url', { url });
    return data;
  },

  // Parse recipe from text
  async parseFromText(text: string): Promise<any> {
    const { data } = await api.post('/api/parser/analyze-text', { text });
    return data;
  },
};

export default recipeService;