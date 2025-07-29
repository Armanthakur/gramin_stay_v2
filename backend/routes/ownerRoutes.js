const express = require('express');
const bcrypt = require('bcryptjs');
const Owner = require('../models/Owner');
const Homestay = require('../models/Homestay');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

// Multer storage config for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'graminstay/homestays',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});
const upload = multer({ storage: storage });

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const owner = await Owner.findOne({ username });

  if (!owner) return res.status(400).json({ message: "Invalid username or password" });

  const isMatch = await bcrypt.compare(password, owner.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid username or password" });

  // Set session
  req.session.user = { username: owner.username, ownerId: owner._id };

  // Add user data to response
  res.json({ 
    message: "Login successful", 
    ownerId: owner._id,
    user: { username: owner.username, ownerId: owner._id } // Add this line
  });
});

// Get homestay for owner
router.get('/homestay/:ownerId', async (req, res) => {
  const homestay = await Homestay.findOne({ owner: req.params.ownerId });
  if (!homestay) return res.json({ message: "No homestay found" });
  res.json(homestay);
});

// Add homestay - Updated for Cloudinary
router.post('/homestay', upload.array('photos', 10), async (req, res) => {
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
  if (existing) return res.status(400).json({ message: "You already have a homestay" });

  // Cloudinary URLs from multer-storage-cloudinary
  const photoPaths = req.files.map(file => file.path);

  const newHomestay = new Homestay({
    owner: ownerId,
    name,
    photos: photoPaths,
    numRooms: numRoomsNum,
    pricePerRoom: pricePerRoomNum,
    location,
    description,
    latitude,
    longitude,
    locationPoint: {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    }
  });

  try {
    await newHomestay.save();
    res.json({ message: "Homestay added", homestay: newHomestay });
  } catch (err) {
    res.status(500).json({ message: "Failed to save homestay", error: err.message });
  }
});

// Update homestay - Updated for Cloudinary
router.put('/homestay/:ownerId', upload.array('photos', 10), async (req, res) => {
  const { name, numRooms, pricePerRoom, location, description, latitude, longitude } = req.body;

  const photoPaths = req.files && req.files.length > 0
    ? req.files.map(file => file.path)
    : undefined;

  const updateData = {
    name,
    numRooms,
    pricePerRoom,
    location,
    description,
    latitude,
    longitude,
  };
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

  if (!homestay) return res.status(400).json({ message: "Homestay not found" });
  res.json({ message: "Homestay updated", homestay });
});

// Remove the BASE_URL variable from the bottom of the file
// Remove: const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://gramin-stay-v2-backend.onrender.com' : 'http://localhost:5000';

// Get homestays by location (city or state, case-insensitive, partial match)
router.get('/homestays/location/:location', async (req, res) => {
  const { location } = req.params;
  // Case-insensitive, partial match
  const homestays = await Homestay.find({
    location: { $regex: new RegExp(location, "i") }
  });
  res.json(homestays);
});

// Get homestays by city (case-insensitive)
router.get('/homestays/city/:cityName', async (req, res) => {
  const { cityName } = req.params;
  const homestays = await Homestay.find({
    location: { $regex: new RegExp(cityName, "i") }
  });
  res.json(homestays);
});

// Find homestays near a location (within 1km)
router.get('/homestays/nearby', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ message: "Latitude and longitude required" });
  }
  // 1km in meters
  const maxDistance = 1000;

  // Ensure geospatial index exists (run once in your DB or add in model)
  // Homestay.collection.createIndex({ locationPoint: "2dsphere" });

  const homestays = await Homestay.find({
    locationPoint: {
      $near: {
        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: maxDistance
      }
    }
  });
  res.json(homestays);
});

// Add homestays
router.post('/homestays', async (req, res) => {
  // handle file upload and save homestay
});

// Get homestay by homestayId (for details page)
router.get('/homestay/:homestayId', async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.params.homestayId);
    if (!homestay) return res.status(404).json({ message: "Homestay not found" });
    res.json(homestay);
  } catch (err) {
    res.status(500).json({ message: "Error fetching homestay", error: err.message });
  }
});

// Get homestay details by homestayId
router.get('/homestay/details/:homestayId', async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.params.homestayId);
    if (!homestay) return res.status(404).json({ message: "Homestay not found" });
    res.json(homestay);
  } catch (err) {
    res.status(500).json({ message: "Error fetching homestay", error: err.message });
  }
});

// Get current logged-in user
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ user: null });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// Contact form endpoint for BecomeHostPage
router.post('/contact-host-request', async (req, res) => {
  const { name, location, rooms, phone, email } = req.body;
  if (!name || !location || !rooms || !phone || !email) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Set up Nodemailer transporter (Gmail)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // your Gmail address
      pass: process.env.GMAIL_PASS, // your Gmail app password
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
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Request sent successfully!' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

module.exports = router;
