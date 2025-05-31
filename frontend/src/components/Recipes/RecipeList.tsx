// src/components/Recipes/RecipeList.tsx
import React, { useEffect, useState } from 'react';
import { RecipeCard } from './RecipeCard';
import { RecipeFilters } from './RecipeFilters';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { Recipe, RecipeFilters as RecipeFiltersType } from '../../types/recipe.types';
import recipeService from '../../services/recipeService';
import './RecipeList.css';

export const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<RecipeFiltersType>({});

  useEffect(() => {
    fetchRecipes();
  }, [filters]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getRecipes(filters);
      setRecipes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: RecipeFiltersType) => {
    setFilters(newFilters);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="recipe-list-container">
      <div className="recipe-list-header">
        <h1>My Recipes</h1>
        <p>{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found</p>
      </div>

      <RecipeFilters onFilterChange={handleFilterChange} currentFilters={filters} />

      {recipes.length === 0 ? (
        <div className="no-recipes">
          <p>No recipes found. Try adjusting your filters or add a new recipe!</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};