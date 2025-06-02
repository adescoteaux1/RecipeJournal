import React from 'react';
import { RecipeCard } from './RecipeCard';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { Recipe } from '../../types/recipe.types';
import './RecipeList.css';

interface RecipeListProps {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
}

export const RecipeList: React.FC<RecipeListProps> = ({ recipes, loading, error }) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  if (recipes.length === 0) {
    return (
      <div className="no-recipes">
        <p>No recipes found. Try adjusting your filters or add a new recipe!</p>
      </div>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};