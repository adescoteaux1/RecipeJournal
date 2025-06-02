import { useState, useCallback, useEffect } from 'react';
import { useRecipes } from '../contexts/RecipeContext';
import { debounce } from '../utils/debounce';

export const useRecipeSearch = (delay: number = 300) => {
  const { searchRecipes } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      searchRecipes(term);
    }, delay),
    [searchRecipes, delay]
  );

  // Update search when term changes
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  return {
    searchTerm,
    setSearchTerm
  };
};