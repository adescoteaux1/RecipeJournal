// src/components/Recipes/RecipeFilters.tsx
import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { RecipeFilters as RecipeFiltersType, FilterOptions } from '../../types/recipe.types';
import recipeService from '../../services/recipeService';
import './RecipeFilters.css';

interface RecipeFiltersProps {
  onFilterChange: (filters: RecipeFiltersType) => void;
  currentFilters: RecipeFiltersType;
}

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({ onFilterChange, currentFilters }) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(currentFilters.tags || []);
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const options = await recipeService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const handleFilterChange = (key: keyof RecipeFiltersType, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    if (!value || value === '') {
      delete newFilters[key];
    }
    onFilterChange(newFilters);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('search', searchTerm);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    handleFilterChange('tags', newTags.length > 0 ? newTags : undefined);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(currentFilters).length > 0;

  if (!filterOptions) return null;

  const displayedTags = showAllTags ? filterOptions.tags : filterOptions.tags.slice(0, 10);

  return (
    <div className="recipe-filters">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-wrapper">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <div className="filter-row">
        <select
          title='Cuisine Type'
          value={currentFilters.cuisine_type || ''}
          onChange={(e) => handleFilterChange('cuisine_type', e.target.value)}
          className="filter-select"
        >
          <option value="">All Cuisines</option>
          {filterOptions.cuisineTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          title='Meal Type'
          value={currentFilters.meal_type || ''}
          onChange={(e) => handleFilterChange('meal_type', e.target.value)}
          className="filter-select"
        >
          <option value="">All Meal Types</option>
          {filterOptions.mealTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          title='Difficulty Level'
          value={currentFilters.difficulty || ''}
          onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          className="filter-select"
        >
          <option value="">All Difficulties</option>
          {filterOptions.difficulties.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="clear-filters-btn">
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>

      <div className="tags-section">
        <h3>Tags</h3>
        <div className="tags-container">
          {displayedTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
            >
              #{tag}
            </button>
          ))}
          {filterOptions.tags.length > 10 && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="show-more-btn"
            >
              {showAllTags ? 'Show less' : `Show all (${filterOptions.tags.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};