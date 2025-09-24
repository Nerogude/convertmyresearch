const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes and middleware
const authRoutes = require('./routes/auth');
const { authenticateToken, requireRole } = require('./middleware/auth');
const { createConnection } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize database connection
createConnection().catch(console.error);

// Authentication routes (public)
app.use('/api/auth', authRoutes);

// Public routes
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Redirect root to login if not authenticated
app.get('/', (req, res) => {
  // For now, serve the main app directly since we don't have session checking on static files
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Care Worker Training Server is running',
    timestamp: new Date().toISOString()
  });
});

// Protected API endpoints
app.get('/api/user', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      role: req.user.role,
      organization: req.user.organization_name,
      licenseType: req.user.license_type
    }
  });
});

// API endpoints
app.get('/api/info', (req, res) => {
  res.json({
    message: 'Care Worker Training API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      auth: '/api/auth/*',
      user: '/api/user'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});