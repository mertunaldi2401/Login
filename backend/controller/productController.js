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
      const filter = { ...textFilter, ...categoryFilter };

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
      const filter = category ? { category } : {};

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

// Create a new product (product-manager only)
exports.createProduct = async (req, res, next) => {
  // Role guard
  if (req.user.role !== 'product-manager') {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  const { name, model, description, quantityInStock, price, cost, image, category, brand } = req.body;
  // Validate required fields
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Invalid or missing product name.' });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ message: 'Invalid or missing price.' });
  }
  try {
    const product = new Product({
      name,
      model,
      description,
      quantityInStock,
      price,
      cost: (typeof cost === 'number' && cost >= 0) ? cost : undefined,
      image,
      category,
      brand
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
