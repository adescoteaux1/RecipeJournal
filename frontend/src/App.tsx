// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { Layout } from './components/Layout/Layout';
import { LoadingSpinner } from './components/Common/LoadingSpinner';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { CreateRecipePage } from './pages/CreateRecipePage';
import { EditRecipePage } from './pages/EditRecipePage';

import './App.css';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <Navigate to="/recipes" /> : <>{children}</>;
};

// App content with providers
const AppContent: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
        
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <RecipesPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/recipes/new"
          element={
            <ProtectedRoute>
              <CreateRecipePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/recipes/:id"
          element={
            <ProtectedRoute>
              <RecipeDetailPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/recipes/:id/edit"
          element={
            <ProtectedRoute>
              <EditRecipePage />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <RecipeProvider>
          <AppContent />
        </RecipeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;