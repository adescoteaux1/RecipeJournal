import React from 'react';
import { Clock, Users, BarChart2, Edit, Trash2, ChefHat } from 'lucide-react';
import { Recipe } from '../../types/recipe.types';
import './RecipeDetail.css';

interface RecipeDetailProps {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
  onMake: () => void;
  isDeleting?: boolean;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onEdit,
  onDelete,
  onMake,
  isDeleting
}) => {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="recipe-detail">
      <div className="recipe-header">
        <img 
          src={recipe.header_image_url || 'https://via.placeholder.com/800x400?text=No+Image'} 
          alt={recipe.title}
          className="recipe-hero-image"
        />
        
        <div className="recipe-header-content">
          <h1>{recipe.title}</h1>
          <p className="recipe-description">{recipe.description}</p>
          
          <div className="recipe-meta">
            {recipe.prep_time && (
              <div className="meta-item">
                <Clock size={20} />
                <span>Prep: {recipe.prep_time} min</span>
              </div>
            )}
            {recipe.cook_time && (
              <div className="meta-item">
                <Clock size={20} />
                <span>Cook: {recipe.cook_time} min</span>
              </div>
            )}
            {recipe.servings && (
              <div className="meta-item">
                <Users size={20} />
                <span>{recipe.servings} servings</span>
              </div>
            )}
            <div className="meta-item">
              <BarChart2 size={20} />
              <span>{recipe.difficulty}</span>
            </div>
          </div>

          <div className="recipe-actions">
            <button onClick={onMake} className="btn btn-primary">
              <ChefHat size={20} />
              I Made This
            </button>
            <button onClick={onEdit} className="btn btn-secondary">
              <Edit size={20} />
              Edit
            </button>
            <button 
              onClick={onDelete} 
              className="btn btn-danger"
              disabled={isDeleting}
            >
              <Trash2 size={20} />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <div className="recipe-content">
        <div className="ingredients-section">
          <h2>Ingredients</h2>
          <ul className="ingredients-list">
            {recipe.ingredients?.map((ingredient) => (
              <li key={ingredient.id}>{ingredient.text}</li>
            ))}
          </ul>
        </div>

        <div className="instructions-section">
          <h2>Instructions</h2>
          <ol className="instructions-list">
            {recipe.instructions?.map((instruction) => (
              <li key={instruction.id}>
                {instruction.text}
                {instruction.instruction_notes?.map(note => (
                  <div key={note.id} className="instruction-note">
                    💡 {note.note}
                  </div>
                ))}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {recipe.tags && recipe.tags.length > 0 && (
        <div className="recipe-tags">
          {recipe.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};