const mongoose = require('mongoose');

const homestaySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
  name: String,
  photos: [String],
  numRooms: Number,
  pricePerRoom: Number,
  location: String,
  latitude: Number,
  longitude: Number,
  description: String,
  locationPoint: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
});

homestaySchema.index({ locationPoint: "2dsphere" });

module.exports = mongoose.model('Homestay', homestaySchema);
