const express = require('express');
const router = express.Router();

const { getAllUsers } = require('../controller/userController');
// Import the authentication middleware
const authenticateToken = require('../middlewares/authMiddleware');
const User = require('../models/User');


// Protected route to get all users
router.get('/', authenticateToken, getAllUsers);

module.exports = router;