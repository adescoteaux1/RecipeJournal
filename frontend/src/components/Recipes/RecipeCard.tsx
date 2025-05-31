// src/components/Recipes/RecipeCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, BarChart2 } from 'lucide-react';
import { Recipe } from '../../types/recipe.types';
import './RecipeCard.css';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const imageUrl = recipe.header_image_url || 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <Link to={`/recipes/${recipe.id}`} className="recipe-card">
      <div className="recipe-card-image">
        <img src={imageUrl} alt={recipe.title} />
        <div className="recipe-card-badges">
          <span className={`badge badge-${recipe.difficulty}`}>{recipe.difficulty}</span>
          <span className="badge">{recipe.meal_type}</span>
        </div>
      </div>
      
      <div className="recipe-card-content">
        <h3>{recipe.title}</h3>
        <p className="recipe-description">{recipe.description}</p>
        
        <div className="recipe-meta">
          {totalTime > 0 && (
            <div className="meta-item">
              <Clock size={16} />
              <span>{totalTime} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="meta-item">
              <Users size={16} />
              <span>{recipe.servings} servings</span>
            </div>
          )}
          <div className="meta-item">
            <BarChart2 size={16} />
            <span>{recipe.cuisine_type}</span>
          </div>
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="recipe-tags">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
            {recipe.tags.length > 3 && <span className="tag">+{recipe.tags.length - 3}</span>}
          </div>
        )}
      </div>
    </Link>
  );
};