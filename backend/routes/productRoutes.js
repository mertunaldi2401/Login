const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');

// ✅ Get all products (with average rating and reviews)
router.get('/', productController.getAllProducts);

// ✅ Get a single product by ID (with average rating and reviews)
router.get('/:id', productController.getProductById);

// ❌ Commented out - POST product creation not needed for now
// router.post('/', productController.createProduct);

module.exports = router;
