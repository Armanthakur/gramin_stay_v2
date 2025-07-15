const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const ownerRoutes = require('./routes/ownerRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect("mongodb://127.0.0.1:27017/graminstay")
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch(err => {
    console.log("❌ Mongo error", err);
  });

app.use('/api', ownerRoutes);
app.use('/api/users', userRoutes);


app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
