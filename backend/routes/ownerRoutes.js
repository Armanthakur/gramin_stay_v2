const express = require('express');
const bcrypt = require('bcryptjs');
const Owner = require('../models/Owner');
const Homestay = require('../models/Homestay');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // relative to backend root
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
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

  res.json({ message: "Login successful", ownerId: owner._id });
});

// Get homestay for owner
router.get('/homestay/:ownerId', async (req, res) => {
  const homestay = await Homestay.findOne({ owner: req.params.ownerId });
  if (!homestay) return res.json({ message: "No homestay found" });
  res.json(homestay);
});

// Add homestay
router.post('/homestay', upload.array('photos', 10), async (req, res) => {
  let { ownerId, name, numRooms, pricePerRoom, location, description } = req.body;

  // If ownerId is an array, use the first element
  if (Array.isArray(ownerId)) {
    ownerId = ownerId[0];
  }

  console.log("Creating homestay with:", { ownerId, name, numRooms, pricePerRoom, location, description });

  if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
    return res.status(400).json({ message: "Valid ownerId is required" });
  }

  // Convert numRooms and pricePerRoom to numbers
  const numRoomsNum = Number(numRooms);
  const pricePerRoomNum = Number(pricePerRoom);

  if (isNaN(numRoomsNum) || isNaN(pricePerRoomNum)) {
    return res.status(400).json({ message: "numRooms and pricePerRoom must be numbers" });
  }

  const existing = await Homestay.findOne({ owner: ownerId });
  if (existing) return res.status(400).json({ message: "You already have a homestay" });

  const photoPaths = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);

  const newHomestay = new Homestay({
    owner: ownerId,
    name,
    photos: photoPaths,
    numRooms: numRoomsNum,
    pricePerRoom: pricePerRoomNum,
    location,
    description,
  });

  try {
    await newHomestay.save();
    res.json({ message: "Homestay added", homestay: newHomestay });
  } catch (err) {
    res.status(500).json({ message: "Failed to save homestay", error: err.message });
  }
});

// Update homestay
router.put('/homestay/:ownerId', upload.array('photos', 10), async (req, res) => {
  const { name, numRooms, pricePerRoom, location, description } = req.body;

  const photoPaths = req.files && req.files.length > 0
    ? req.files.map(file => `http://localhost:5000/uploads/${file.filename}`)
    : undefined;

  const updateData = {
    name,
    numRooms,
    pricePerRoom,
    location,
    description,
  };

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

// Add homestays
router.post('/homestays', async (req, res) => {
  // handle file upload and save homestay
});

module.exports = router;
