const express = require('express');
const router = express.Router();
const productController = require('./controllers/productController');

// Search products with optional query
router.get('/search', productController.searchProducts);

// Get all products (with optional category filter)
router.get('/', productController.getAllProducts);

// Get single product by ID
router.get('/:id', productController.getProductById);

// Create a new product
router.post('/', productController.createProduct);

// Get distinct categories
router.get('/categories/list', productController.getDistinctCategories);

// Get products grouped by category
router.get('/grouped', productController.getGroupedProducts);

module.exports = router;