const express = require('express');
const router = express.Router();

const { getAllUsers } = require('./userController');
const authenticateToken = require('./authMiddleware');

router.get('/users', authenticateToken, getAllUsers);

module.exports = router;