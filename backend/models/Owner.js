const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  username: String,
  password: String,
});

module.exports = mongoose.model('Owner', ownerSchema);
