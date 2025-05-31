// src/server.js - Updated with better logging
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const parserRoutes = require('./routes/parserRoutes');
const tagRoutes = require('./routes/tagRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Custom morgan token to log request body
morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('error', (req, res) => res.locals.error || '');

// Enhanced logging format
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :error'));

// Log all requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('\n--- Incoming Request ---');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    console.log('-------------------\n');
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api', commentRoutes);
app.use('/api/parser', parserRoutes);
app.use('/api/tags', tagRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  // Log the full error
  console.error('\n--- Error Details ---');
  console.error('URL:', req.method, req.url);
  console.error('Error Message:', err.message);
  console.error('Stack:', err.stack);
  if (err.response) {
    console.error('Response data:', err.response.data);
  }
  console.error('-------------------\n');

  // Store error for morgan
  res.locals.error = err.message;

  // Send appropriate error response
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Log responses in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const oldSend = res.send;
    res.send = function(data) {
      console.log('\n--- Response ---');
      console.log('Status:', res.statusCode);
      console.log('Body:', data);
      console.log('-------------------\n');
      res.send = oldSend;
      return res.send(data);
    };
    next();
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Logging level: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});