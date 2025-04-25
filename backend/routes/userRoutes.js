const express = require('express');
const router = express.Router();

const { getAllUsers, getUserProfile, addToWishlist, getWishlist } = require('../controller/userController');
const authenticateToken = require('../middlewares/authMiddleware');
const User = require('../models/User');

// all users
router.get('/', authenticateToken, getAllUsers);

// profile (kendi yazdığımız route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Failed to retrieve profile.' });
  }
});

// wishlist
router.post('/wishlist/:productId', authenticateToken, addToWishlist);
router.get('/wishlist', authenticateToken, getWishlist);

module.exports = router;
