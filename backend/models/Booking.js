const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  homestayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homestay',
    required: true
  },
  userId: {
    type: String, // Can be changed to ObjectId if you have a User model
    required: true
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema); 