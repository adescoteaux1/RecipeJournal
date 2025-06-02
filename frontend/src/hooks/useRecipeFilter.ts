import { useMemo } from 'react';
import { useRecipes } from '../contexts/RecipeContext';
import { RecipeFilters } from '../types/recipe.types';

export const useRecipeFilters = () => {
  const { filters, setFilters, clearFilters, filterOptions } = useRecipes();

  const updateFilter = (key: keyof RecipeFilters, value: any) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setFilters(newFilters);
  };

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    updateFilter('tags', newTags.length > 0 ? newTags : undefined);
  };

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  return {
    filters,
    filterOptions,
    updateFilter,
    toggleTag,
    clearFilters,
    hasActiveFilters
  };
};