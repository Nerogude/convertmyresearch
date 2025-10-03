const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Register new organization (admin)
router.post('/register-organization', async (req, res) => {
  try {
    const { orgName, orgCode, email, password, firstName, lastName } = req.body;

    // Validate input
    if (!orgName || !orgCode || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if organization code already exists
    const orgCheck = await db.query(
      'SELECT id FROM organizations WHERE code = $1',
      [orgCode.toUpperCase()]
    );

    if (orgCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Organization code already exists' });
    }

    // Check if email already exists
    const emailCheck = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create organization
    const orgResult = await db.query(
      'INSERT INTO organizations (name, code) VALUES ($1, $2) RETURNING id',
      [orgName, orgCode.toUpperCase()]
    );

    const organizationId = orgResult.rows[0].id;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const userResult = await db.query(
      `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role`,
      [organizationId, email.toLowerCase(), passwordHash, firstName, lastName, 'admin']
    );

    const user = userResult.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, organizationId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Organization and admin account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organizationId
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, organizationId: user.organization_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organizationId: user.organization_id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Create user (manager/admin only)
router.post('/create-user', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    const { organizationId } = req.user;

    // Validate input
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['learner', 'manager'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Managers can only create learners, admins can create both
    if (req.user.role === 'manager' && role !== 'learner') {
      return res.status(403).json({ error: 'Managers can only create learner accounts' });
    }

    // Check if email already exists
    const emailCheck = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role`,
      [organizationId, email.toLowerCase(), passwordHash, firstName, lastName, role]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Server error during user creation' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.organization_id, o.name as organization_name
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      organizationId: user.organization_id,
      organizationName: user.organization_name
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

module.exports = router;
