const express = require('express');
const router = express.Router();

const { getAllUsers, getUserProfile, addToWishlist, getWishlist } = require('../controller/userController');
const authenticateToken = require('../middlewares/authMiddleware');
const User = require('../models/User');

// all users
router.get('/', authenticateToken, getAllUsers);

// profile
router.get('/profile', authenticateToken, getUserProfile);

// wishlist
router.post('/wishlist/:productId', authenticateToken, addToWishlist);
router.get('/wishlist', authenticateToken, getWishlist);

module.exports = router;