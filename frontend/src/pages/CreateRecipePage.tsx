// src/pages/CreateRecipe/CreateRecipe.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, FileText, ArrowLeft } from 'lucide-react';
import { RecipeForm } from '../components/Recipes/RecipeForm';
import { RecipeUrlParser } from '../components/RecipeParser/RecipeURLParser';
import { CreateRecipeData } from '../types/recipe.types';
import { useRecipes } from '../contexts/RecipeContext';
import './CreateRecipePage.css';

export const CreateRecipePage = () => {
  const navigate = useNavigate();
  const { createRecipe, loading, error } = useRecipes();
  const [showUrlParser, setShowUrlParser] = useState(false);
  const [initialData, setInitialData] = useState<Partial<CreateRecipeData>>();
  const [showOptions, setShowOptions] = useState(true);

  const handleSubmit = async (data: CreateRecipeData) => {
    try {
      await createRecipe(data);
      navigate('/recipes');
    } catch (err) {
      // Error is already handled by the context and stored in the error state
      console.error('Failed to create recipe:', err);
    }
  };

  const handleRecipeParsed = (parsedData: Partial<CreateRecipeData>) => {
    setInitialData(parsedData);
    setShowUrlParser(false);
    setShowOptions(false);
  };

  const handleStartManual = () => {
    setShowOptions(false);
    setInitialData(undefined);
  };

  if (showOptions && !initialData) {
    return (
      <div className="create-recipe-page">
        <div className="page-header">
          <button onClick={() => navigate('/recipes')} className="back-button">
            <ArrowLeft size={20} />
            Back to Recipes
          </button>
          <h1>Create New Recipe</h1>
        </div>

        <div className="creation-options">
          <div className="option-card" onClick={() => setShowUrlParser(true)}>
            <div className="option-icon">
              <Link2 size={32} />
            </div>
            <h3>Import from URL</h3>
            <p>Automatically import a recipe from any recipe website</p>
          </div>

          <div className="option-card" onClick={handleStartManual}>
            <div className="option-icon">
              <FileText size={32} />
            </div>
            <h3>Create Manually</h3>
            <p>Enter your recipe details from scratch</p>
          </div>
        </div>

        {showUrlParser && (
          <RecipeUrlParser
            onRecipeParsed={handleRecipeParsed}
            onClose={() => setShowUrlParser(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="create-recipe-page">
      <div className="page-header">
        <button onClick={() => navigate('/recipes')} className="back-button">
          <ArrowLeft size={20} />
          Back to Recipes
        </button>
        <h1>{initialData ? 'Review & Edit Recipe' : 'Create New Recipe'}</h1>
      </div>

      {initialData && initialData.source_url && (
        <div className="import-notice">
          <Link2 size={16} />
          <span>Imported from: </span>
          <a href={initialData.source_url} target="_blank" rel="noopener noreferrer">
            {new URL(initialData.source_url).hostname}
          </a>
        </div>
      )}

      <RecipeForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={loading}
        error={error}
      />
    </div>
  );
};