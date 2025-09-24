const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { getConnection } = require('../database/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  orgCode: Joi.string().min(3).max(10).uppercase().required(),
  role: Joi.string().valid('manager', 'staff').default('staff')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Generate JWT token
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, firstName, lastName, orgCode, role } = value;

    const db = await getConnection();

    // Check if user already exists
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Verify organization code
    const [organizations] = await db.execute('SELECT id, name FROM organizations WHERE org_code = ?', [orgCode]);
    if (organizations.length === 0) {
      return res.status(400).json({ error: 'Invalid organization code' });
    }

    const organizationId = organizations[0].id;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (email, password_hash, first_name, last_name, role, organization_id) VALUES (?, ?, ?, ?, ?, ?)',
      [email, passwordHash, firstName, lastName, role, organizationId]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName,
        role,
        organization: organizations[0].name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;
    const db = await getConnection();

    // Get user with organization data
    const [users] = await db.execute(`
      SELECT u.*, o.name as organization_name, o.license_type
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.email = ? AND u.is_active = true
    `, [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Update last login
    await db.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Store refresh token
    await db.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [user.id, refreshToken]
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organization: user.organization_name,
        licenseType: user.license_type
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const db = await getConnection();

    // Verify refresh token exists and is valid
    const [tokens] = await db.execute(
      'SELECT id FROM refresh_tokens WHERE user_id = ? AND token = ? AND expires_at > NOW()',
      [decoded.userId, refreshToken]
    );

    if (tokens.length === 0) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Get user data
    const [users] = await db.execute(`
      SELECT u.*, o.name as organization_name, o.license_type
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = ? AND u.is_active = true
    `, [decoded.userId]);

    if (users.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }

    const user = users[0];
    const { accessToken } = generateTokens(user);

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ error: 'Token refresh failed' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const db = await getConnection();
      await db.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;