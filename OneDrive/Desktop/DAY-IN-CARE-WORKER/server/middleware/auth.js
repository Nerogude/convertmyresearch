const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Get fresh user data from database
    const db = await getConnection();
    const [users] = await db.execute(
      `SELECT u.*, o.name as organization_name, o.license_type
       FROM users u
       LEFT JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = ? AND u.is_active = true`,
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Check user role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];

    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Check if user has access to scenario (based on license)
const checkScenarioAccess = async (req, res, next) => {
  try {
    const { scenarioId } = req.params;
    const user = req.user;

    // Admin has access to everything
    if (user.role === 'admin') {
      return next();
    }

    // Check if organization has full license or if it's a trial scenario
    const trialScenarios = [1, 2]; // Scenarios 1 and 2 are trial
    const hasAccess = user.license_type === 'full' || trialScenarios.includes(parseInt(scenarioId));

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Upgrade required',
        message: 'This scenario requires a full license'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Access check failed' });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  checkScenarioAccess,
  JWT_SECRET
};