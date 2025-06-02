import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { RecipeFilters as RecipeFiltersType, FilterOptions } from '../../types/recipe.types';
import { useRecipeSearch } from '../../hooks/useRecipeSearch';
import './RecipeFilters.css';

interface RecipeFiltersProps {
  filters: RecipeFiltersType;
  filterOptions: FilterOptions | null;
  onFilterChange: (key: keyof RecipeFiltersType, value: any) => void;
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onTagToggle,
  onClearFilters,
  hasActiveFilters
}) => {
  const { searchTerm, setSearchTerm } = useRecipeSearch();
  const [showAllTags, setShowAllTags] = useState(false);

  if (!filterOptions) return null;

    // Provide default empty arrays if properties are undefined
  const cuisineTypes = filterOptions.cuisineTypes || [];
  const mealTypes = filterOptions.mealTypes || [];
  const difficulties = filterOptions.difficulties || [];
  const tags = filterOptions.tags || [];

  const displayedTags = showAllTags ? filterOptions.tags : filterOptions.tags.slice(0, 10);

  return (
    <div className="recipe-filters">
      <div className="search-form">
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
      </div>

      <div className="filter-row">
        <select
          title='Cuisine Type'
          value={filters.cuisine_type || ''}
          onChange={(e) => onFilterChange('cuisine_type', e.target.value)}
          className="filter-select"
        >
          <option value="">All Cuisines</option>
          {cuisineTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          title='Meal Type'
          value={filters.meal_type || ''}
          onChange={(e) => onFilterChange('meal_type', e.target.value)}
          className="filter-select"
        >
          <option value="">All Meal Types</option>
          {mealTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          title='Difficulty Level'
          value={filters.difficulty || ''}
          onChange={(e) => onFilterChange('difficulty', e.target.value)}
          className="filter-select"
        >
          <option value="">All Difficulties</option>
          {difficulties.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button onClick={onClearFilters} className="clear-filters-btn">
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <div className="tags-section">
          <h3>Tags</h3>
          <div className="tags-container">
            {displayedTags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`tag-btn ${filters.tags?.includes(tag) ? 'active' : ''}`}
              >
                #{tag}
              </button>
            ))}
            {tags.length > 10 && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="show-more-btn"
              >
                {showAllTags ? 'Show less' : `Show all (${tags.length})`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};