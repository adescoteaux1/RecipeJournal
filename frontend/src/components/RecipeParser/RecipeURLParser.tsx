import React, { useState } from 'react';
import { Link2, Loader, Check, AlertCircle } from 'lucide-react';
import { CreateRecipeData } from '../../types/recipe.types';
import api from '../../services/api';
import './RecipeURLParser.css';

interface RecipeUrlParserProps {
  onRecipeParsed: (data: Partial<CreateRecipeData>) => void;
  onClose: () => void;
}

export const RecipeUrlParser: React.FC<RecipeUrlParserProps> = ({
  onRecipeParsed,
  onClose
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleParseUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('api/parser/parse-url', { url });
      
      if (response.data.success) {
        setParsedData(response.data.data);
        setShowPreview(true);
      } else {
        setError('Failed to parse recipe from URL');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to parse recipe. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseParsedData = () => {
    if (parsedData) {
      // Convert parsed data to match CreateRecipeData format
      const formattedData: Partial<CreateRecipeData> = {
        title: parsedData.title || '',
        description: parsedData.description || '',
        prep_time: parsedData.prep_time || undefined,
        cook_time: parsedData.cook_time || undefined,
        servings: parsedData.servings || undefined,
        header_image_url: parsedData.header_image_url || undefined,
        source_url: url,
        ingredients: parsedData.ingredients || [],
        instructions: parsedData.instructions || [],
        // Set default values for required fields
        cuisine_type: 'other',
        meal_type: 'other',
        difficulty: 'medium',
        tags: []
      };

      onRecipeParsed(formattedData);
    }
  };

  return (
    <div className="url-parser-modal">
      <div className="url-parser-content">
        <div className="url-parser-header">
          <h2>Import Recipe from URL</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {!showPreview ? (
          <div className="url-input-section">
            <p className="helper-text">
              Paste a URL from a recipe website and we'll automatically extract the recipe details.
            </p>
            
            <div className="url-input-group">
              <Link2 className="url-icon" size={20} />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/recipe"
                className="url-input"
                onKeyPress={(e) => e.key === 'Enter' && handleParseUrl()}
              />
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="parser-actions">
              <button 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleParseUrl}
                disabled={isLoading || !url.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader className="spinning" size={16} />
                    Parsing...
                  </>
                ) : (
                  'Parse Recipe'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="preview-section">
            <h3>Recipe Preview</h3>
            <div className="preview-content">
              <div className="preview-item">
                <strong>Title:</strong> {parsedData.title || 'No title found'}
              </div>
              
              {parsedData.description && (
                <div className="preview-item">
                  <strong>Description:</strong> 
                  <p>{parsedData.description}</p>
                </div>
              )}

              <div className="preview-grid">
                {parsedData.prep_time && (
                  <div className="preview-item">
                    <strong>Prep Time:</strong> {parsedData.prep_time} min
                  </div>
                )}
                {parsedData.cook_time && (
                  <div className="preview-item">
                    <strong>Cook Time:</strong> {parsedData.cook_time} min
                  </div>
                )}
                {parsedData.servings && (
                  <div className="preview-item">
                    <strong>Servings:</strong> {parsedData.servings}
                  </div>
                )}
              </div>

              <div className="preview-item">
                <strong>Ingredients:</strong> {parsedData.ingredients?.length || 0} items
              </div>

              <div className="preview-item">
                <strong>Instructions:</strong> {parsedData.instructions?.length || 0} steps
              </div>

              {parsedData.header_image_url && (
                <div className="preview-item">
                  <strong>Image:</strong> 
                  <Check size={16} className="success-icon" /> Found
                </div>
              )}
            </div>

            <div className="preview-note">
              <AlertCircle size={16} />
              <span>You'll be able to edit all details before saving the recipe.</span>
            </div>

            <div className="parser-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowPreview(false);
                  setParsedData(null);
                  setUrl('');
                }}
              >
                Try Another URL
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleUseParsedData}
              >
                Use This Recipe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};