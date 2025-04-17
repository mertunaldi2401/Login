const express = require('express');
const router = express.Router();

const { getAllUsers } = require('./userController');
const authenticateToken = require('./authMiddleware');

// Protected route to get all users
router.get('/', authenticateToken, getAllUsers);

module.exports = router;