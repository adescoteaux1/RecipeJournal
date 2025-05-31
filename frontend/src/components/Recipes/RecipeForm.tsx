// src/components/Recipes/RecipeForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Save } from 'lucide-react';
import { CreateRecipeData, CuisineType, MealType, DifficultyLevel } from '../../types/recipe.types';
import recipeService from '../../services/recipeService';
import { ErrorMessage } from '../Common/ErrorMessage';
import './RecipeForm.css';

export const RecipeForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<CreateRecipeData>({
    title: '',
    description: '',
    prep_time: undefined,
    cook_time: undefined,
    servings: undefined,
    cuisine_type: 'other',
    meal_type: 'other',
    difficulty: 'medium',
    ingredients: [{ text: '', amount: '', unit: '', item: '', order_index: 0 }],
    instructions: [{ step_number: 1, text: '' }],
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');

  const handleBasicInfoChange = (field: keyof CreateRecipeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { text: '', amount: '', unit: '', item: '', order_index: prev.ingredients.length }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { step_number: prev.instructions.length + 1, text: '' }]
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? { ...inst, text: value } : inst
      )
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const recipe = await recipeService.createRecipe(formData);
      navigate(`/recipes/${recipe.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create recipe');
      setLoading(false);
    }
  };

  return (
    <div className="recipe-form-container">
      <h1>Create New Recipe</h1>
      
      {error && <ErrorMessage message={error} />}
      
      <form onSubmit={handleSubmit} className="recipe-form">
        {/* Basic Information */}
        <section className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">Recipe Title*</label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleBasicInfoChange('title', e.target.value)}
              placeholder="Enter recipe title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleBasicInfoChange('description', e.target.value)}
              placeholder="Brief description of your recipe"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cuisine">Cuisine Type</label>
              <select
                id="cuisine"
                value={formData.cuisine_type}
                onChange={(e) => handleBasicInfoChange('cuisine_type', e.target.value as CuisineType)}
              >
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="chinese">Chinese</option>
                <option value="indian">Indian</option>
                <option value="american">American</option>
                <option value="french">French</option>
                <option value="thai">Thai</option>
                <option value="japanese">Japanese</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="meal">Meal Type</label>
              <select
                id="meal"
                value={formData.meal_type}
                onChange={(e) => handleBasicInfoChange('meal_type', e.target.value as MealType)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="dessert">Dessert</option>
                <option value="snack">Snack</option>
                <option value="appetizer">Appetizer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleBasicInfoChange('difficulty', e.target.value as DifficultyLevel)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prep">Prep Time (minutes)</label>
              <input
                id="prep"
                type="number"
                value={formData.prep_time || ''}
                onChange={(e) => handleBasicInfoChange('prep_time', parseInt(e.target.value) || undefined)}
                placeholder="15"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cook">Cook Time (minutes)</label>
              <input
                id="cook"
                type="number"
                value={formData.cook_time || ''}
                onChange={(e) => handleBasicInfoChange('cook_time', parseInt(e.target.value) || undefined)}
                placeholder="30"
              />
            </div>

            <div className="form-group">
              <label htmlFor="servings">Servings</label>
              <input
                id="servings"
                type="number"
                value={formData.servings || ''}
                onChange={(e) => handleBasicInfoChange('servings', parseInt(e.target.value) || undefined)}
                placeholder="4"
              />
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section className="form-section">
          <h2>Ingredients</h2>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <input
                type="text"
                value={ingredient.text}
                onChange={(e) => updateIngredient(index, 'text', e.target.value)}
                placeholder="e.g., 2 cups flour"
                className="ingredient-input"
              />
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="btn-icon"
                >
                  <Minus size={20} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngredient} className="btn btn-secondary">
            <Plus size={20} /> Add Ingredient
          </button>
        </section>

        {/* Instructions */}
        <section className="form-section">
          <h2>Instructions</h2>
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="instruction-row">
              <span className="step-number">{index + 1}.</span>
              <textarea
                value={instruction.text}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder="Describe this step..."
                rows={2}
              />
              {formData.instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="btn-icon"
                >
                  <Minus size={20} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addInstruction} className="btn btn-secondary">
            <Plus size={20} /> Add Step
          </button>
        </section>

        {/* Tags */}
        <section className="form-section">
          <h2>Tags</h2>
          <div className="tag-input-row">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
            />
            <button type="button" onClick={addTag} className="btn btn-secondary">
              Add Tag
            </button>
          </div>
          <div className="tags-display">
            {formData.tags?.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>×</button>
              </span>
            ))}
          </div>
        </section>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/recipes')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={20} />
            {loading ? 'Creating...' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
};