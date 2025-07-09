const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const Owner = require('../models/Owner');
const Homestay = require('../models/Homestay');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
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
// Get homestays by location
router.get('/homestays/location/:location', async (req, res) => {
  try {
    const homestays = await Homestay.find({
      location: { $regex: new RegExp(`^${req.params.location}$`, 'i') }
    });
    res.json(homestays);
  } catch (err) {
    res.status(500).json({ message: "Error fetching homestays", error: err });
  }
});



// Add homestay
router.post('/homestay', upload.array("photos"), async (req, res) => {
  const { ownerId, name, numRooms, pricePerRoom, location, description } = req.body;

  const existing = await Homestay.findOne({ owner: ownerId });
  if (existing) return res.status(400).json({ message: "You already have a homestay" });

  const photoPaths = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);

  const newHomestay = new Homestay({
    owner: ownerId,
    name,
    photos: photoPaths,
    numRooms,
    pricePerRoom,
    location,
    description,
  });

  await newHomestay.save();
  res.json({ message: "Homestay added", homestay: newHomestay });
});

// Update homestay
router.put('/homestay/:ownerId', upload.array("photos"), async (req, res) => {
  const { name, numRooms, pricePerRoom, location, description } = req.body;

  let updateData = { name, numRooms, pricePerRoom, location, description };

  if (req.files && req.files.length > 0) {
    const photoPaths = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
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

module.exports = router;
