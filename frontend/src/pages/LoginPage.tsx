import React from 'react';
import { LoginForm } from '../components/Auth/LoginForm';
import './AuthPages.css';

export const LoginPage: React.FC = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <LoginForm />
      </div>
    </div>
  );
};