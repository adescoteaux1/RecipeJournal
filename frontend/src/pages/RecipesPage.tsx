import React from 'react';
import { RecipeList } from '../components/Recipes/RecipeList';
import { RecipeFilters } from '../components/Recipes/RecipeFilters';
import { useRecipes } from '../contexts/RecipeContext';
import { useRecipeFilters } from '../hooks/useRecipeFilter';
import './RecipesPage.css';

export const RecipesPage: React.FC = () => {
  const { filteredRecipes, loading, error } = useRecipes();
  const { filters, filterOptions, updateFilter, toggleTag, clearFilters, hasActiveFilters } = useRecipeFilters();

  return (
    <div className="recipes-page">
      <div className="page-header">
        <h1>My Recipes</h1>
        <p>{filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found</p>
      </div>

      <RecipeFilters
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={updateFilter}
        onTagToggle={toggleTag}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <RecipeList
        recipes={filteredRecipes}
        loading={loading}
        error={error}
      />
    </div>
  );
};