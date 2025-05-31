import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, PlusCircle, Home } from 'lucide-react';
import './Header.css';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <span>🍳</span> Recipe Tracker
        </Link>
        
        <nav className="nav">
          {user ? (
            <>
              <Link to="/recipes" className="nav-link">
                <Home size={20} />
                My Recipes
              </Link>
              <Link to="/recipes/new" className="nav-link">
                <PlusCircle size={20} />
                Add Recipe
              </Link>
              <button onClick={handleSignOut} className="nav-link logout-btn">
                <LogOut size={20} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
