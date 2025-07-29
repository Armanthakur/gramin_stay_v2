const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const { homestayId, userId, fromDate, toDate } = req.body;
    if (!homestayId || !userId || !fromDate || !toDate) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const booking = new Booking({
      homestayId,
      userId,
      fromDate,
      toDate
    });
    await booking.save();
    res.status(201).json({ message: 'Booking successful', booking });
  } catch (err) {
    console.error('Booking error:', err); // Log the real error
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings/homestay/:homestayId - get all bookings for a homestay
router.get('/homestay/:homestayId', async (req, res) => {
  try {
    const bookings = await Booking.find({ homestayId: req.params.homestayId }).sort({ fromDate: 1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router; 