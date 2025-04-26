// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Reviews');
const authRequired = require('../middlewares/authMiddleware');
const verifyDeliveredPurchase = require('../middlewares/verifyDeliveredPurchaseMiddleware');

// POST /products/:productId/reviews → must be mounted with `/products`
router.post(
  '/:productId/reviews',
  authRequired,
  verifyDeliveredPurchase,
  async (req, res) => {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user._id;

    try {
      // Prevent duplicate reviews
      const existingReview = await Review.findOne({ productId, userId });
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this product.' });
      }

      const newReview = await Review.create({
        productId,
        userId,
        rating,
        comment,
        approved: false  // 🔥 Yorumlar otomatik onaylı gelmeyecek
      });

      res.status(201).json(newReview);
    } catch (err) {
      console.error('Review create error:', err);
      res.status(500).json({ error: 'Could not save review.' });
    }
  }
);

module.exports = router;