const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const authenticateToken = require('../middlewares/authMiddleware');

console.log('authenticateToken:', typeof authenticateToken);
console.log('createProduct     :', typeof productController.createProduct);

// ✅ Get all products (with average rating and reviews)
router.get('/', productController.getAllProducts);

// ✅ Get a single product by ID (with average rating and reviews)
router.get('/:id', productController.getProductById);

// Add a new product (product-manager only)
router.post(
  '/',
  authenticateToken,
  productController.createProduct
);

// Delete a product (product-manager only)
router.delete(
  '/:id',
  authenticateToken,
  productController.deleteProduct
);

// PATCH /products/:id/stock → update stock, only product-manager
router.patch(
  '/:id/stock',
  authenticateToken,
  async (req, res, next) => {
    // Role guard
    if (req.user.role !== 'product-manager') {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    const { quantityInStock } = req.body;
    if (typeof quantityInStock !== 'number' || quantityInStock < 0) {
      return res.status(400).json({ message: 'Invalid stock quantity.' });
    }
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        { quantityInStock },
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      res.json({ message: 'Stock updated.', product });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
