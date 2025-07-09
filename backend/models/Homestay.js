const mongoose = require('mongoose');

const homestaySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
  name: String,
  photos: [String], // URLs or base64 for now
  numRooms: Number,
  pricePerRoom: Number,
  location: String,
  description: String,
});

module.exports = mongoose.model('Homestay', homestaySchema);
