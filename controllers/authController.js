const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

// ── POST /api/auth/signup ──────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required.' });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    // Check if email already exists
    const existing = await User.getByEmail(email);
    if (existing)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const insertId = await User.create({ name, email, password: hashed });
    const user     = await User.getById(insertId);

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user
    });

  } catch (err) {
    console.error('signup error:', err.message);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    // Find user
    const user = await User.getByEmail(email);
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.getById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

module.exports = { signup, login, getMe };