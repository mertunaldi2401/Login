// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

// Register Route (aynı kalıyor)
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
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

// Login Route (BURAYI DEĞİŞTİRİYORUZ 🔥)
router.post('/login', async (req, res) => {
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

    // 🔥 BURADA ARTIK role BİLGİSİNİ DE TOKEN'A KOYUYORUZ
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role || 'user'  // Eğer rolü yoksa 'user' diye default set ediyoruz
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: `Welcome, ${user.username}!`, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error logging in.' });
  }
});

module.exports = router;