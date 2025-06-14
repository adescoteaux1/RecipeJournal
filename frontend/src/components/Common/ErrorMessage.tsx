import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="error-message">
      <p>{message}</p>
    </div>
  );
};