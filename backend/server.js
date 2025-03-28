const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const connectDB = require('./db');
const User = require('./User');
const Product = require('./Product');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');


const app = express();
const PORT = 5001; 
const JWT_SECRET = 'g363308cs'; 

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes 
app.use('/auth', authRoutes);    // /auth/register, /auth/login
app.use('/users', userRoutes);   // /users route
app.use('/cart', cartRoutes); 
app.use('/orders', orderRoutes);

// ============================
// Product Routes
// ============================

// GET all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// POST a new product
app.post('/products', async (req, res) => {
  const {
    name,
    description,
    price,
    stock,
    image,
    category,
    brand,
    isFeatured,
    rating,
    numReviews
  } = req.body;

  // validation
  if (!name || price === undefined || stock === undefined || !category) {
    return res.status(400).json({ message: 'Name, price, stock, and category are required.' });
  }

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      image,
      category,
      brand,
      isFeatured,
      rating,
      numReviews
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully!', product: newProduct });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({
      message: 'Error creating product',
      error: err.message
    });
  }
});

// ============================
// Start the server
// ============================
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});