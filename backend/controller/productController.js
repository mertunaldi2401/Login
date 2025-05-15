const Product = require('../models/Product');
const Review = require('../models/Reviews');

// Helper function to calculate average rating
const calculateAverageRating = async (productId) => {
  const reviews = await Review.find({ productId, approved: true });
  const numReviews = reviews.length;
  const averageRating = numReviews > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / numReviews
    : 0;
  return { averageRating: Number(averageRating.toFixed(1)), numReviews };
};

// Search products (optional query, category, discounted)
exports.searchProducts = async (req, res) => {
  try {
    const { q, category, discounted } = req.query;

    const textFilter = q ? { $text: { $search: q } } : {};
    const categoryFilter = category ? { category } : {};
    const discountedFilter = discounted === 'true' ? { discounted: true } : {};

    const filter = { isPriced: true, ...textFilter, ...categoryFilter, ...discountedFilter };

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
    const { category, discounted } = req.query;

    const categoryFilter = category ? { category } : {};
    const discountedFilter = discounted === 'true' ? { discounted: true } : {};

    const filter = { isPriced: true, ...categoryFilter, ...discountedFilter };

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

// Get single product by ID (only if priced)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isPriced: true }).lean();
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const { averageRating, numReviews } = await calculateAverageRating(product._id);

    res.json({ ...product, averageRating, numReviews });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Error retrieving product.' });
  }
};
