import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '../contexts/RecipeContext';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { recipes } = useRecipes();

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to Recipe Tracker</h1>
        <p>Your personal cookbook in the cloud</p>
        
        {user ? (
          <div className="hero-stats">
            <div className="stat-card">
              <h3>{recipes.length}</h3>
              <p>Recipes</p>
            </div>
            <div className="stat-card">
              <h3>{new Set(recipes.flatMap(r => r.tags || [])).size}</h3>
              <p>Tags</p>
            </div>
            <Link to="/recipes/new" className="btn btn-primary">
              Create New Recipe
            </Link>
          </div>
        ) : (
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};