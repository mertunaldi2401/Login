const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const authenticateToken = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');
const Product = require('../models/Product');

// ✅ Get all products (with average rating and reviews)
router.get('/', productController.getAllProducts);

// ✅ Get unpriced products (sales-manager only)
router.get('/unpriced', authenticateToken, productController.getUnpricedProducts);

// ✅ Get a single product by ID
router.get('/:id', productController.getProductById);

// ✅ Create a new product (product-manager only)
router.post('/', authenticateToken, productController.createProduct);

// ✅ Delete a product (product-manager only)
router.delete('/:id', authenticateToken, productController.deleteProduct);

// ✅ Update stock (product-manager only)
router.patch('/:id/stock', authenticateToken, async (req, res, next) => {
  if (req.user.role !== 'product-manager') {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }

  const { id } = req.params;
  const { quantityInStock } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Product not found.' });
  }

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
});

// ✅ Apply discount (sales-manager only)
router.patch('/:id/discount', authenticateToken, productController.setDiscount);

// ✅ Set price (sales-manager only)
router.patch('/:id/set-price', authenticateToken, async (req, res, next) => {
  if (req.user.role !== 'sales-manager') {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }

  const { id } = req.params;
  const { price } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ message: 'Invalid price.' });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { price, priceSetBySalesManager: true },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Price updated and approved by sales manager.', product });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
