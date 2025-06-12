import React, { useState } from 'react';
import { Plus, Minus, Save, Link, Image } from 'lucide-react';
import { CreateRecipeData, CuisineType, MealType, DifficultyLevel } from '../../types/recipe.types';
import { ErrorMessage } from '../Common/ErrorMessage';
import './RecipeForm.css';

interface RecipeFormProps {
  initialData?: Partial<CreateRecipeData>;
  onSubmit: (data: CreateRecipeData) => Promise<any>;
  isSubmitting: boolean;
  error: string | null;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ 
  initialData, 
  onSubmit,
  isSubmitting, 
  error 
}) => {
  const [formData, setFormData] = useState<CreateRecipeData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    prep_time: initialData?.prep_time || undefined,
    cook_time: initialData?.cook_time || undefined,
    servings: initialData?.servings || undefined,
    source_url: initialData?.source_url || '',
    header_image_url: initialData?.header_image_url || '',
    cuisine_type: initialData?.cuisine_type || 'other',
    meal_type: initialData?.meal_type || 'other',
    difficulty: initialData?.difficulty || 'medium',
    ingredients: initialData?.ingredients || [{ text: '', amount: '', unit: '', item: '', order_index: 0 }],
    instructions: initialData?.instructions || [{ step_number: 1, text: '' }],
    tags: initialData?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');

  const handleBasicInfoChange = (field: keyof CreateRecipeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Recipe title is required');
      return;
    }
    
    // Filter out empty ingredients and instructions
    const cleanedData: CreateRecipeData = {
      ...formData,
      title: formData.title.trim(),
      description: (formData.description ?? '').trim(),
      source_url: formData.source_url?.trim() || undefined,
      header_image_url: formData.header_image_url?.trim() || undefined,
      // Filter out empty ingredients
      ingredients: formData.ingredients.filter(ing => ing.text.trim()),
      // Filter out empty instructions
      instructions: formData.instructions.filter(inst => inst.text.trim())
        .map((inst, index) => ({ ...inst, step_number: index + 1 })), // Renumber steps
      // Filter out empty tags
      tags: formData.tags?.filter(tag => tag.trim()) || []
    };
    
    // Check if we have at least one ingredient and instruction
    if (cleanedData.ingredients.length === 0) {
      alert('Please add at least one ingredient');
      return;
    }
    
    if (cleanedData.instructions.length === 0) {
      alert('Please add at least one instruction');
      return;
    }
    
    await onSubmit(cleanedData);
  };

  const addIngredient = () => {
    // Only add if the last ingredient isn't empty
    const lastIngredient = formData.ingredients[formData.ingredients.length - 1];
    if (!lastIngredient || lastIngredient.text.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, { text: '', amount: '', unit: '', item: '', order_index: prev.ingredients.length }]
      }));
    }
  };

  const addInstruction = () => {
    // Only add if the last instruction isn't empty
    const lastInstruction = formData.instructions[formData.instructions.length - 1];
    if (!lastInstruction || lastInstruction.text.trim()) {
      setFormData(prev => ({
        ...prev,
        instructions: [...prev.instructions, { step_number: prev.instructions.length + 1, text: '' }]
      }));
    }
  };

  return (
    <div className="recipe-form-container">
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

          {/* Source URL and Image URL fields */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="source_url">
                <Link size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Recipe Source URL
              </label>
              <input
                id="source_url"
                type="url"
                value={formData.source_url || ''}
                onChange={(e) => handleBasicInfoChange('source_url', e.target.value)}
                placeholder="https://example.com/recipe"
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="header_image_url">
                <Image size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Recipe Image URL
              </label>
              <input
                id="header_image_url"
                type="url"
                value={formData.header_image_url || ''}
                onChange={(e) => handleBasicInfoChange('header_image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Show image preview if URL is provided */}
          {formData.header_image_url && (
            <div className="image-preview" style={{ marginTop: '10px', marginBottom: '20px' }}>
              <img 
                src={formData.header_image_url} 
                alt="Recipe preview" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '150px', 
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cuisine">Cuisine Type</label>
              <select
                title='Cuisine Type'
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
                title='Meal Type'
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
                title='Difficulty Level'
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
                  title='Remove Ingredient'
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="btn-icon"
                >
                  <Minus size={20} />
                </button>
              )}
            </div>
          ))}
          <button title='Add Ingredient' type="button" onClick={addIngredient} className="btn btn-secondary">
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
                  title='Remove Step'
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="btn-icon"
                >
                  <Minus size={20} />
                </button>
              )}
            </div>
          ))}
          <button title='Add Step' type="button" onClick={addInstruction} className="btn btn-secondary">
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
            <button title='Add Tag' type="button" onClick={addTag} className="btn btn-secondary">
              Add Tag
            </button>
          </div>
          <div className="tags-display">
            {formData.tags?.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
                <button title='Remove Tag' type="button" onClick={() => removeTag(tag)}>×</button>
              </span>
            ))}
          </div>
        </section>

        <div className="form-actions">
          <button title='Cancel' type="button" onClick={() => window.history.back()} className="btn btn-secondary">
            Cancel
          </button>
          <button title='Save' type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <Save size={20} />
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Recipe' : 'Create Recipe')}
          </button>
        </div>
      </form>
    </div>
  );
};