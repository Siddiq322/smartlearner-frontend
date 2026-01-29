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
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'],
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
    version: '1.0.0'
  });
});

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});