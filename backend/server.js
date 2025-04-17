// backend/server.js
require('dotenv').config();                     // ① load .env first

const express = require('express');
const cors    = require('cors');

const connectDB     = require('./db');
const authRoutes    = require('./authRoutes');
const userRoutes    = require('./userRoutes');
const cartRoutes    = require('./cartRoutes');
const orderRoutes   = require('./orderRoutes');
const productRoutes = require('./productRoutes');
const reviewRoutes  = require('./routes/reviewRoutes');

const app  = express();
const PORT = process.env.PORT || 5001;          // ② use env var, fallback 5000

// ③ JWT_SECRET no longer stored here – each module reads process.env.JWT_SECRET

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth',    authRoutes);
app.use('/users',   userRoutes);
app.use('/cart',    cartRoutes);
app.use('/orders',  orderRoutes);
app.use('/products', productRoutes);
app.use('/products', reviewRoutes);             // review sub‑routes

// Start server
app.listen(PORT, () => {
  console.log(`✅  Server is running on http://localhost:${PORT}`);
});