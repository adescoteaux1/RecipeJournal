import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipe } from '../hooks/useRecipe';
import { useRecipeMutations } from '../hooks/useRecipeMutations';
import { RecipeDetail } from '../components/Recipes/RecipeDetail';
import { RecipeMakeModal } from '../components/Recipes/RecipeMakeModal';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import './RecipeDetailPage.css';

export const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recipe, loading, error } = useRecipe(id);
  const { remove, isDeleting } = useRecipeMutations();
  const [showMakeModal, setShowMakeModal] = useState(false);

  const handleEdit = () => {
    navigate(`/recipes/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      await remove(id!);
    }
  };

  const handleMake = () => {
    setShowMakeModal(true);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!recipe) return <ErrorMessage message="Recipe not found" />;

  return (
    <div className="recipe-detail-page">
      <RecipeDetail
        recipe={recipe}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMake={handleMake}
        isDeleting={isDeleting}
      />
      
      {showMakeModal && (
        <RecipeMakeModal
          recipeId={recipe.id}
          onClose={() => setShowMakeModal(false)}
        />
      )}
    </div>
  );
};