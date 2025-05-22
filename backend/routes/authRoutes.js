const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Cart = require('../models/Cart'); 

const JWT_SECRET = process.env.JWT_SECRET; // Should be from env in production

// Register Route
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    // Kullanıcı adı veya e-posta ile eşleşen biri var mı?
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error registering user.' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  console.log('REQ BODY:', req.body);
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { 
        id: user._id,           // 🛠 BUNU EKLİYORSUN
        username: user.username, 
        email: user.email,
        role: user.role  
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    /* ---------- GUEST-CART → USER-CART MERGE ---------- */
    const guestSessionId = req.headers['x-guest-session'];
    if (guestSessionId) {
       const guestCart = await Cart.findOne({ guestSessionId });
      if (guestCart && guestCart.items.length) {
        // Find or create user cart
        let userCart = await Cart.findOne({ user: user._id });
        if (!userCart) {
          userCart = new Cart({ user: user._id, items: [] });
        }
        // Merge items (sum quantities, avoid duplicates)
        guestCart.items.forEach(gItem => {
          const existing = userCart.items.find(
            ui => ui.product.toString() === gItem.product.toString()
          );
          if (existing) {
            existing.quantity += gItem.quantity;
          } else {
            userCart.items.push({ product: gItem.product, quantity: gItem.quantity });
          }
        });
        await userCart.save();
        await Cart.deleteOne({ _id: guestCart._id });  // remove temp cart
      }
    }
    /* -------------------------------------------------- */

    res.json({ message: `Welcome, ${user.username}!`, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error logging in.' });
  }
});

module.exports = router;