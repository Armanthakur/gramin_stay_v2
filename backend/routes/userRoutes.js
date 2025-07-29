const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register new user
router.post('/register', async (req, res) => {
  const { username, phone, password } = req.body;
  if (!username || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const user = new User({ username, phone, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User login or register (session-based)
router.post('/login', async (req, res) => {
  const { username, phone, password } = req.body;
  if (!username || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    let user = await User.findOne({ phone });
    if (!user) {
      // Register new user
      user = new User({ username, phone, password });
      await user.save();
      req.session.user = { username: user.username, userId: user._id, phone: user.phone };
      return res.status(201).json({ 
        message: 'User registered and logged in', 
        userId: user._id,
        user: { username: user.username, userId: user._id, phone: user.phone } // Add this line
      });
    }
    // User exists, check password
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid phone or password' });
    }
    // Set session
    req.session.user = { username: user.username, userId: user._id, phone: user.phone };
    res.json({ 
      message: 'Login successful', 
      userId: user._id,
      user: { username: user.username, userId: user._id, phone: user.phone } // Add this line
    });
  } catch (err) {
    console.error('User login/register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;