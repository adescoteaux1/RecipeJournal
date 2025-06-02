// src/components/Recipes/RecipeMakeModal.tsx
import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import recipeService from '../../services/recipeService';
import { useRecipes } from '../../contexts/RecipeContext';
import './RecipeMakeModal.css';

interface RecipeMakeModalProps {
  recipeId: string;
  onClose: () => void;
}

export const RecipeMakeModal: React.FC<RecipeMakeModalProps> = ({ recipeId, onClose }) => {
  const { fetchRecipe } = useRecipes();
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await recipeService.recordMake(recipeId, rating, notes);
      // Refresh the recipe to get updated makes count
      await fetchRecipe(recipeId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record make');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>I Made This Recipe!</h2>
          <button title='Close' onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>How would you rate this recipe?</label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  title='Rate this recipe'
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`star-btn ${star <= rating ? 'active' : ''}`}
                >
                  <Star size={24} fill={star <= rating ? '#ffc107' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any modifications or comments about how it turned out?"
              rows={4}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};