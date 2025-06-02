import { useState, useEffect } from 'react';
import { useRecipes } from '../contexts/RecipeContext';
import { Recipe } from '../types/recipe.types';

export const useRecipe = (id: string | undefined) => {
  const { fetchRecipe, selectedRecipe, loading, error } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (id) {
      fetchRecipe(id).then(setRecipe).catch(() => setRecipe(null));
    }
  }, [id, fetchRecipe]);

  return {
    recipe: recipe || selectedRecipe,
    loading,
    error,
    refetch: () => id ? fetchRecipe(id) : Promise.resolve()
  };
};