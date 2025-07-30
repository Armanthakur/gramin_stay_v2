require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const ownerRoutes = require('./routes/ownerRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const path = require('path');
const session = require('express-session');

const app = express();
app.use(cors({
  origin: 'https://graminstay.com/',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true, // Changed to true for HTTPS
    httpOnly: true,
    sameSite: 'none', // Added for cross-origin requests
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect("mongodb+srv://ammuarmaanthakur:1mYTquuAjrez7XSg@clustergraminsay.gnvifz.mongodb.net/?retryWrites=true&w=majority&appName=Clustergraminsay")
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch(err => {
    console.log("❌ Mongo error", err);
  });

app.use('/api', ownerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

// Catch-all logger for unmatched routes
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.originalUrl);
  res.status(404).send('Not found');
});


app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
