// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const categoryController = require('../controller/categoryController');

// Create a new category
router.post(
  '/',
  authenticateToken,
  categoryController.createCategory
);

// Delete a category if unused
router.delete(
  '/:id',
  authenticateToken,
  categoryController.deleteCategory
);

module.exports = router;