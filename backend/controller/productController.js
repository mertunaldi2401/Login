  const Product = require('../models/Product');
  const Review = require('../models/Reviews');
  const mongoose = require('mongoose');

  // Helper function to calculate average rating
  const calculateAverageRating = async (productId) => {
    const reviews = await Review.find({ productId, approved: true });
    const numReviews = reviews.length;
    const averageRating = numReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / numReviews
      : 0;
    return { averageRating: Number(averageRating.toFixed(1)), numReviews };
  };

  // Search products (optional query and category)
  exports.searchProducts = async (req, res) => {
    try {
      const { q, category } = req.query;

      const textFilter = q ? { $text: { $search: q } } : {};
      const categoryFilter = category ? { category } : {};
      let filter = { ...textFilter, ...categoryFilter };

      // Only show products with priceSetBySalesManager: true for normal users
      if (
        !req.user ||
        (req.user.role !== 'product-manager' && req.user.role !== 'sales-manager')
      ) {
        filter.priceSetBySalesManager = true;
      }

      const products = await Product.find(filter)
        .sort({ quantityInStock: -1, name: 1 })
        .select('-__v')
        .lean();

      const productsWithRatings = await Promise.all(products.map(async (product) => {
        const { averageRating, numReviews } = await calculateAverageRating(product._id);
        return { ...product, averageRating, numReviews };
      }));

      res.json(productsWithRatings);
    } catch (err) {
      console.error('Product search error:', err);
      res.status(500).json({ error: 'Server error searching products.' });
    }
  };

  // Get all products
  exports.getAllProducts = async (req, res) => {
    try {
      const { category } = req.query;
      let filter = {};
      if (category) filter.category = category;

      // Only show products with priceSetBySalesManager: true for normal users
      if (
        !req.user ||
        (req.user.role !== 'product-manager' && req.user.role !== 'sales-manager')
      ) {
        filter.priceSetBySalesManager = true;
      }

      const products = await Product.find(filter)
        .sort({ quantityInStock: -1, name: 1 })
        .select('-__v')
        .lean();

      const productsWithRatings = await Promise.all(products.map(async (product) => {
        const { averageRating, numReviews } = await calculateAverageRating(product._id);
        return { ...product, averageRating, numReviews };
      }));

      res.json(productsWithRatings);
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ message: 'Error fetching products', error: err.message });
    }
  };

  // Get single product by ID
  exports.getProductById = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).lean();
      if (!product) return res.status(404).json({ message: 'Product not found.' });

      const { averageRating, numReviews } = await calculateAverageRating(product._id);

      res.json({ ...product, averageRating, numReviews });
    } catch (err) {
      console.error('Error fetching product:', err);
      res.status(500).json({ message: 'Error retrieving product.' });
    }
  };

  exports.createProduct = async (req, res, next) => {
    if (req.user.role !== 'product-manager') {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    const { name, model, description, quantityInStock, image, category, brand } = req.body;
  
    // Validate required fields
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing product name.' });
    }
    if (quantityInStock == null || typeof quantityInStock !== 'number' || quantityInStock < 0) {
      return res.status(400).json({ message: 'Invalid or missing quantityInStock.' });
    }
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing category.' });
    }
  
    // Do NOT allow price or cost fields to be set by frontend!
    try {
      const product = new Product({
        name,
        model,
        description,
        quantityInStock,
        price: 0, // Always 0 at creation
        // Do NOT send cost; let the schema default (price/2)
        image,
        category,
        brand,
        priceSetBySalesManager: false // Mark as not set yet
      });
      await product.save();
      res.status(201).json({ message: 'Product created.', product });
    } catch (err) {
      next(err);
    }
  };

// Delete a product (product-manager only)
exports.deleteProduct = async (req, res, next) => {
  // Role guard
  if (req.user.role !== 'product-manager') {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  const { id } = req.params;
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Product not found.' });
  }
  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
};

// Get all products that still need pricing (sales-manager only)
exports.getUnpricedProducts = async (req, res, next) => {
  if (req.user.role !== 'sales-manager') {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  try {
    const products = await Product.find({ priceSetBySalesManager: false })
      .select('-__v')
      .lean();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// Set Discount (sales-manager only)
exports.setDiscount = async (req, res) => {
  const { id } = req.params;
  const { discountPercentage } = req.body;

  if (!req.user || req.user.role !== 'sales-manager') {
    return res.status(403).json({ message: 'Only sales managers can apply discounts.' });
  }

  if (typeof discountPercentage !== 'number' || discountPercentage < 0 || discountPercentage > 100) {
    return res.status(400).json({ message: 'Invalid discount percentage.' });
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    if (!product.originalPrice) {
      product.originalPrice = product.price;
    }

    product.discountPercentage = discountPercentage;
    product.price = Math.round(product.originalPrice * (1 - discountPercentage / 100) * 100) / 100;

    await product.save();
    res.json({ message: 'Discount applied.', product });
  } catch (err) {
    console.error('Error applying discount:', err);
    res.status(500).json({ message: 'Server error applying discount.' });
  }
};
