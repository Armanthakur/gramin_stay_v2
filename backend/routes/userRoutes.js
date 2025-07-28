const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');

// JWT middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    
    if (!username || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { phone }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.username === username ? 'Username already exists' : 'Phone number already registered'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({ 
      username, 
      phone, 
      password: hashedPassword 
    });
    
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: user.username, 
        userId: user._id.toString(),
        phone: user.phone
      },
      process.env.JWT_SECRET || 'your-jwt-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      userId: user._id,
      username: user.username
    });
  } catch (err) {
    console.error('User registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// User login with JWT
router.post('/login', async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    if (!username && !phone) {
      return res.status(400).json({ error: 'Username or phone number is required' });
    }

    // Find user by username or phone
    const query = username ? { username } : { phone };
    let user = await User.findOne(query);
    
    if (!user) {
      // If user doesn't exist and we have all required fields, register them
      if (username && phone) {
        console.log('User not found, creating new user...');
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        user = new User({ username, phone, password: hashedPassword });
        await user.save();
        
        // Generate JWT token for new user
        const token = jwt.sign(
          { 
            username: user.username, 
            userId: user._id.toString(),
            phone: user.phone
          },
          process.env.JWT_SECRET || 'your-jwt-secret-key',
          { expiresIn: '24h' }
        );
        
        return res.status(201).json({ 
          message: 'User registered and logged in', 
          token,
          userId: user._id,
          username: user.username
        });
      } else {
        return res.status(400).json({ error: 'User not found. Please provide both username and phone to register.' });
      }
    }

    // Verify password for existing user
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: user.username, 
        userId: user._id.toString(),
        phone: user.phone
      },
      process.env.JWT_SECRET || 'your-jwt-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login successful', 
      token,
      userId: user._id,
      username: user.username
    });
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user info (protected route)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile (protected route)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, phone } = req.body;
    
    if (!username && !phone) {
      return res.status(400).json({ error: 'At least one field (username or phone) is required' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username or phone already exists' });
    }
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password (protected route)
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(req.user.userId, { 
      password: hashedNewPassword 
    });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout (JWT-based - client-side token removal)
router.post('/logout', (req, res) => {
  // With JWT, logout is handled on client-side by removing the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;