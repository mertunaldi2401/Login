const Product = require('../models/Product');
const Review = require('../models/Reviews');

// Get ALL Products (with average rating)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const productsWithRatings = await Promise.all(products.map(async (product) => {
      const reviews = await Review.find({ productId: product._id, approved: true });

      const numReviews = reviews.length;
      const averageRating = numReviews > 0 
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / numReviews 
        : 0;

      return {
        ...product.toObject(),
        averageRating: Number(averageRating.toFixed(1)),
        numReviews,
      };
    }));

    res.json(productsWithRatings);
  } catch (err) {
    console.error('Error fetching products with ratings:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get SINGLE Product by ID (with average rating)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const reviews = await Review.find({ productId: product._id, approved: true });

    const numReviews = reviews.length;
    const averageRating = numReviews > 0 
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / numReviews 
      : 0;

    res.json({
      ...product.toObject(),
      averageRating: Number(averageRating.toFixed(1)),
      numReviews,
    });
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};
