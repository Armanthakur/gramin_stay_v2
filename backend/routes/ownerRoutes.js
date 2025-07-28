const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Owner = require('../models/Owner');
const Homestay = require('../models/Homestay');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Environment variable validation for Cloudinary
console.log('🔍 Checking Cloudinary environment variables...');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

// Cloudinary configuration with validation
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Missing Cloudinary environment variables!');
  console.error('Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  // Test Cloudinary connection
  cloudinary.api.ping()
    .then(result => console.log('✅ Cloudinary connection successful'))
    .catch(error => console.error('❌ Cloudinary connection failed:', error.message));
}

// Enhanced Multer storage config with error handling
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'graminstay/homestays',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

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

// Login with JWT
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const owner = await Owner.findOne({ username });
    if (!owner) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: owner.username, 
        ownerId: owner._id.toString()
      },
      process.env.JWT_SECRET || 'your-jwt-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      message: "Login successful", 
      token,
      ownerId: owner._id,
      username: owner.username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current logged-in user (JWT-based)
router.get('/me', verifyToken, (req, res) => {
  res.json({ 
    user: {
      username: req.user.username,
      ownerId: req.user.ownerId
    }
  });
});

// Logout (JWT-based - client-side token removal)
router.post('/logout', (req, res) => {
  // With JWT, logout is handled on client-side by removing the token
  res.json({ message: 'Logged out successfully' });
});

// Get homestay for owner
router.get('/homestay/:ownerId', async (req, res) => {
  try {
    const homestay = await Homestay.findOne({ owner: req.params.ownerId });
    if (!homestay) {
      return res.json({ message: "No homestay found" });
    }
    res.json(homestay);
  } catch (error) {
    console.error('Error fetching homestay:', error);
    res.status(500).json({ message: "Error fetching homestay" });
  }
});

// Add homestay with enhanced error handling
router.post('/homestay', upload.array('photos', 10), async (req, res) => {
  try {
    let { ownerId, name, numRooms, pricePerRoom, location, description, latitude, longitude } = req.body;

    if (Array.isArray(ownerId)) {
      ownerId = ownerId[0];
    }

    console.log("Creating homestay with:", { ownerId, name, numRooms, pricePerRoom, location, description });

    if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: "Valid ownerId is required" });
    }

    const numRoomsNum = Number(numRooms);
    const pricePerRoomNum = Number(pricePerRoom);

    if (isNaN(numRoomsNum) || isNaN(pricePerRoomNum)) {
      return res.status(400).json({ message: "numRooms and pricePerRoom must be numbers" });
    }

    const existing = await Homestay.findOne({ owner: ownerId });
    if (existing) {
      return res.status(400).json({ message: "You already have a homestay" });
    }

    // Handle photo uploads
    const photoPaths = req.files ? req.files.map(file => {
      console.log('Uploaded file path:', file.path);
      return file.path;
    }) : [];

    const newHomestay = new Homestay({
      owner: ownerId,
      name,
      photos: photoPaths,
      numRooms: numRoomsNum,
      pricePerRoom: pricePerRoomNum,
      location,
      description,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      locationPoint: latitude && longitude ? {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      } : undefined
    });

    await newHomestay.save();
    console.log('✅ Homestay created successfully');
    res.json({ message: "Homestay added", homestay: newHomestay });
    
  } catch (error) {
    console.error('❌ Error creating homestay:', error);
    
    if (error.message.includes('Only image files are allowed')) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }
    
    if (error.message.includes('File too large')) {
      return res.status(400).json({ message: "File size too large. Maximum 5MB allowed." });
    }
    
    if (error.message.includes('Must supply api_key')) {
      return res.status(500).json({ message: "Server configuration error. Please contact support." });
    }
    
    res.status(500).json({ 
      message: "Failed to save homestay", 
      error: error.message 
    });
  }
});

// Update homestay with enhanced error handling
router.put('/homestay/:ownerId', upload.array('photos', 10), async (req, res) => {
  try {
    console.log('🔄 Update homestay attempt - Files received:', req.files?.length || 0);
    
    const { name, numRooms, pricePerRoom, location, description, latitude, longitude } = req.body;

    const photoPaths = req.files && req.files.length > 0
      ? req.files.map(file => {
          console.log('Uploaded file path:', file.path);
          return file.path;
        })
      : undefined;

    const updateData = {
      name,
      numRooms: numRooms ? Number(numRooms) : undefined,
      pricePerRoom: pricePerRoom ? Number(pricePerRoom) : undefined,
      location,
      description,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    if (latitude && longitude) {
      updateData.locationPoint = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }
    
    if (photoPaths) {
      updateData.photos = photoPaths;
    }

    const homestay = await Homestay.findOneAndUpdate(
      { owner: req.params.ownerId },
      updateData,
      { new: true }
    );

    if (!homestay) {
      return res.status(404).json({ message: "Homestay not found" });
    }
    
    console.log('✅ Homestay updated successfully');
    res.json({ message: "Homestay updated", homestay });
    
  } catch (error) {
    console.error('❌ Error updating homestay:', error);
    
    if (error.message.includes('Only image files are allowed')) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }
    
    if (error.message.includes('File too large')) {
      return res.status(400).json({ message: "File size too large. Maximum 5MB allowed." });
    }
    
    if (error.message.includes('Must supply api_key')) {
      return res.status(500).json({ message: "Server configuration error. Please contact support." });
    }
    
    res.status(500).json({ 
      message: "Failed to update homestay", 
      error: error.message 
    });
  }
});

// Get homestays by location (city or state, case-insensitive, partial match)
router.get('/homestays/location/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const homestays = await Homestay.find({
      location: { $regex: new RegExp(location, "i") }
    });
    res.json(homestays);
  } catch (error) {
    console.error('Error fetching homestays by location:', error);
    res.status(500).json({ message: "Error fetching homestays" });
  }
});

// Get homestays by city (case-insensitive)
router.get('/homestays/city/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    const homestays = await Homestay.find({
      location: { $regex: new RegExp(cityName, "i") }
    });
    res.json(homestays);
  } catch (error) {
    console.error('Error fetching homestays by city:', error);
    res.status(500).json({ message: "Error fetching homestays" });
  }
});

// Find homestays near a location (within 1km)
router.get('/homestays/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }
    
    const maxDistance = 1000; // 1km in meters

    const homestays = await Homestay.find({
      locationPoint: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: maxDistance
        }
      }
    });
    res.json(homestays);
  } catch (error) {
    console.error('Error fetching nearby homestays:', error);
    res.status(500).json({ message: "Error fetching nearby homestays" });
  }
});

// Get homestay by homestayId (for details page)
router.get('/homestay/:homestayId', async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.params.homestayId);
    if (!homestay) {
      return res.status(404).json({ message: "Homestay not found" });
    }
    res.json(homestay);
  } catch (err) {
    console.error('Error fetching homestay:', err);
    res.status(500).json({ message: "Error fetching homestay", error: err.message });
  }
});

// Get homestay details by homestayId
router.get('/homestay/details/:homestayId', async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.params.homestayId);
    if (!homestay) {
      return res.status(404).json({ message: "Homestay not found" });
    }
    res.json(homestay);
  } catch (err) {
    console.error('Error fetching homestay details:', err);
    res.status(500).json({ message: "Error fetching homestay", error: err.message });
  }
});

// Contact form endpoint for BecomeHostPage
router.post('/contact-host-request', async (req, res) => {
  try {
    const { name, location, rooms, phone, email } = req.body;
    
    if (!name || !location || !rooms || !phone || !email) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate Gmail credentials
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error('Gmail credentials not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: 'armanthakur9690@gmail.com',
      subject: 'New GraminStay Host Listing Request',
      html: `
        <h2>New Host Listing Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Location:</b> ${location}</p>
        <p><b>Rooms:</b> ${rooms}</p>
        <p><b>Submitted:</b> ${new Date().toLocaleString()}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Request sent successfully!' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

module.exports = router;