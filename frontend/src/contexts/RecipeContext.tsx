import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Recipe, RecipeFilters, FilterOptions } from '../types/recipe.types';
import recipeService from '../services/recipeService';
import { useAuth } from './AuthContext';

interface RecipeContextType {
  // State
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  selectedRecipe: Recipe | null;
  filters: RecipeFilters;
  filterOptions: FilterOptions | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRecipes: () => Promise<void>;
  fetchRecipe: (id: string) => Promise<Recipe>;
  createRecipe: (data: any) => Promise<Recipe>;
  updateRecipe: (id: string, data: any) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  setFilters: (filters: RecipeFilters) => void;
  clearFilters: () => void;
  searchRecipes: (searchTerm: string) => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
};

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all recipes
  const fetchRecipes = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await recipeService.getRecipes();
      setRecipes(data);
      setFilteredRecipes(data); // Initially show all recipes
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch single recipe
  const fetchRecipe = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await recipeService.getRecipe(id);
      setSelectedRecipe(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recipe');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create recipe
  const createRecipe = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const newRecipe = await recipeService.createRecipe(data);
      setRecipes(prev => [...prev, newRecipe]);
      setFilteredRecipes(prev => [...prev, newRecipe]);
      return newRecipe;
    } catch (err: any) {
      setError(err.message || 'Failed to create recipe');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update recipe
  const updateRecipe = useCallback(async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const updatedRecipe = await recipeService.updateRecipe(id, data);
      setRecipes(prev => prev.map(r => r.id === id ? updatedRecipe : r));
      setFilteredRecipes(prev => prev.map(r => r.id === id ? updatedRecipe : r));
      if (selectedRecipe?.id === id) {
        setSelectedRecipe(updatedRecipe);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update recipe');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedRecipe]);

  // Delete recipe
  const deleteRecipe = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await recipeService.deleteRecipe(id);
      setRecipes(prev => prev.filter(r => r.id !== id));
      setFilteredRecipes(prev => prev.filter(r => r.id !== id));
      if (selectedRecipe?.id === id) {
        setSelectedRecipe(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete recipe');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedRecipe]);

  // Client-side filtering
  const applyFilters = useCallback(() => {
    let filtered = [...recipes];

    // Filter by cuisine type
    if (filters.cuisine_type) {
      filtered = filtered.filter(r => r.cuisine_type === filters.cuisine_type);
    }

    // Filter by meal type
    if (filters.meal_type) {
      filtered = filtered.filter(r => r.meal_type === filters.meal_type);
    }

    // Filter by difficulty
    if (filters.difficulty) {
      filtered = filtered.filter(r => r.difficulty === filters.difficulty);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(recipe => {
        if (!recipe.tags) return false;
        return filters.tags!.every(tag => recipe.tags!.includes(tag));
      });
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchLower) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchLower)) ||
        (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    setFilteredRecipes(filtered);
  }, [recipes, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: RecipeFilters) => {
    setFilters(newFilters);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Search recipes
  const searchRecipes = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  }, []);

  // Apply filters whenever filters or recipes change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Fetch recipes when user logs in
  useEffect(() => {
    if (user) {
      fetchRecipes();
      // Fetch filter options once
      recipeService.getFilterOptions().then(setFilterOptions).catch(console.error);
    }
  }, [user, fetchRecipes]);

  // Extract unique tags from all recipes for filter options
  useEffect(() => {
    const allTags = new Set<string>();
    recipes.forEach(recipe => {
      recipe.tags?.forEach(tag => allTags.add(tag));
    });
    
    setFilterOptions(prev => ({
      ...prev!,
      tags: Array.from(allTags).sort()
    }));
  }, [recipes]);

  return (
    <RecipeContext.Provider value={{
      recipes,
      filteredRecipes,
      selectedRecipe,
      filters,
      filterOptions,
      loading,
      error,
      fetchRecipes,
      fetchRecipe,
      createRecipe,
      updateRecipe,
      deleteRecipe,
      setFilters: updateFilters,
      clearFilters,
      searchRecipes
    }}>
      {children}
    </RecipeContext.Provider>
  );
};