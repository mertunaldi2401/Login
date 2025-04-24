const express = require('express');
const router = express.Router();
 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
 
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
      { id: user._id, username: user.username },
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