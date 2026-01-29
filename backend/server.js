const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const routes = require('./routes');
const config = require('./config/config');

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'https://smartlearner-frontend.vercel.app',
    'https://smartlearner-frontend.netlify.app',
    'https://smartlearner-5660.onrender.com',
    /\.vercel\.app$/,
    /\.netlify\.app$/,
    /\.onrender\.com$/
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', routes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Learning Backend API is running!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  console.log('404 HANDLER - Route not found:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path
  });
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'PATCH /api/auth/profile',
      'POST /api/tasks/add',
      'GET /api/tasks',
      'PUT /api/tasks/:id',
      'DELETE /api/tasks/:id'
    ]
  });
});

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});