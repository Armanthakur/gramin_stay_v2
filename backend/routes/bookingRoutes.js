const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Booking = require('../models/Booking');
const Homestay = require('../models/Homestay');

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

// POST /api/bookings - Create new booking (protected route)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { homestayId, fromDate, toDate } = req.body;
    const userId = req.user.userId;
    
    if (!homestayId || !fromDate || !toDate) {
      return res.status(400).json({ error: 'Homestay ID, from date, and to date are required.' });
    }

    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const now = new Date();

    if (from < now) {
      return res.status(400).json({ error: 'From date cannot be in the past.' });
    }

    if (to <= from) {
      return res.status(400).json({ error: 'To date must be after from date.' });
    }

    // Check if homestay exists
    const homestay = await Homestay.findById(homestayId);
    if (!homestay) {
      return res.status(404).json({ error: 'Homestay not found.' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      homestayId,
      $or: [
        { fromDate: { $lte: to }, toDate: { $gte: from } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ error: 'Selected dates are not available.' });
    }

    const booking = new Booking({
      homestayId,
      userId,
      fromDate: from,
      toDate: to
    });
    
    await booking.save();
    
    // Populate homestay details in response
    const populatedBooking = await Booking.findById(booking._id).populate('homestayId');
    
    res.status(201).json({ 
      message: 'Booking successful', 
      booking: populatedBooking 
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings/user - Get all bookings for current user (protected route)
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await Booking.find({ userId })
      .populate('homestayId')
      .sort({ createdAt: -1 });
    
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/homestay/:homestayId - Get all bookings for a homestay
router.get('/homestay/:homestayId', async (req, res) => {
  try {
    const { homestayId } = req.params;
    
    // Validate homestay ID
    if (!homestayId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid homestay ID format' });
    }

    const bookings = await Booking.find({ homestayId })
      .sort({ fromDate: 1 });
    
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching homestay bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/availability/:homestayId - Check availability for a homestay
router.get('/availability/:homestayId', async (req, res) => {
  try {
    const { homestayId } = req.params;
    const { fromDate, toDate } = req.query;
    
    if (!fromDate || !toDate) {
      return res.status(400).json({ error: 'From date and to date are required' });
    }

    // Validate homestay ID
    if (!homestayId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid homestay ID format' });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      homestayId,
      $or: [
        { fromDate: { $lte: to }, toDate: { $gte: from } }
      ]
    });

    const isAvailable = conflictingBookings.length === 0;
    
    res.json({ 
      available: isAvailable,
      conflictingBookings: conflictingBookings.length 
    });
  } catch (err) {
    console.error('Error checking availability:', err);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// PUT /api/bookings/:bookingId - Update booking (protected route)
router.put('/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { fromDate, toDate } = req.body;
    const userId = req.user.userId;

    // Validate booking ID
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'You can only update your own bookings' });
    }

    // Validate new dates if provided
    if (fromDate || toDate) {
      const from = new Date(fromDate || booking.fromDate);
      const to = new Date(toDate || booking.toDate);
      const now = new Date();

      if (from < now) {
        return res.status(400).json({ error: 'From date cannot be in the past' });
      }

      if (to <= from) {
        return res.status(400).json({ error: 'To date must be after from date' });
      }

      // Check for conflicting bookings (excluding current booking)
      const conflictingBooking = await Booking.findOne({
        _id: { $ne: bookingId },
        homestayId: booking.homestayId,
        $or: [
          { fromDate: { $lte: to }, toDate: { $gte: from } }
        ]
      });

      if (conflictingBooking) {
        return res.status(400).json({ error: 'Selected dates are not available' });
      }

      booking.fromDate = from;
      booking.toDate = to;
    }

    await booking.save();
    
    const updatedBooking = await Booking.findById(bookingId).populate('homestayId');
    
    res.json({ 
      message: 'Booking updated successfully', 
      booking: updatedBooking 
    });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// DELETE /api/bookings/:bookingId - Cancel booking (protected route)
router.delete('/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    // Validate booking ID
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'You can only cancel your own bookings' });
    }

    // Check if booking can be cancelled (e.g., not too close to start date)
    const now = new Date();
    const daysDifference = (booking.fromDate - now) / (1000 * 60 * 60 * 24);
    
    if (daysDifference < 1) {
      return res.status(400).json({ error: 'Cannot cancel booking less than 24 hours before check-in' });
    }

    await Booking.findByIdAndDelete(bookingId);
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// GET /api/bookings/:bookingId - Get specific booking details (protected route)
router.get('/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    // Validate booking ID
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(bookingId).populate('homestayId');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'You can only view your own bookings' });
    }

    res.json({ booking });
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

module.exports = router;