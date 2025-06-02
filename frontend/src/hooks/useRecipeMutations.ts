import { useState } from 'react';
import { useRecipes } from '../contexts/RecipeContext';
import { CreateRecipeData } from '../types/recipe.types';
import { useNavigate } from 'react-router-dom';

export const useRecipeMutations = () => {
  const navigate = useNavigate();
  const { createRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateRecipeData) => {
    setIsCreating(true);
    setError(null);
    try {
      const recipe = await createRecipe(data);
      navigate(`/recipes/${recipe.id}`);
      return recipe;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const update = async (id: string, data: Partial<CreateRecipeData>) => {
    setIsUpdating(true);
    setError(null);
    try {
      await updateRecipe(id, data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const remove = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteRecipe(id);
      navigate('/recipes');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isDeleting,
    error
  };
};