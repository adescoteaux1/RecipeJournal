import React from 'react';
import { useParams } from 'react-router-dom';
import { RecipeForm } from '../components/Recipes/RecipeForm';
import { useRecipe } from '../hooks/useRecipe';
import { useRecipeMutations } from '../hooks/useRecipeMutations';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import './EditRecipePage.css';

export const EditRecipePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { recipe, loading, error: loadError } = useRecipe(id);
  const { update, isUpdating, error: updateError } = useRecipeMutations();

  const handleSubmit = async (data: any) => {
    await update(id!, data);
  };

  if (loading) return <LoadingSpinner />;
  if (loadError) return <ErrorMessage message={loadError} />;
  if (!recipe) return <ErrorMessage message="Recipe not found" />;

  return (
    <div className="edit-recipe-page">
      <div className="page-header">
        <h1>Edit Recipe</h1>
      </div>
      
      <RecipeForm
        initialData={recipe}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
        error={updateError}
      />
    </div>
  );
};