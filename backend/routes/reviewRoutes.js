const express = require('express');
const router = express.Router();
const Review = require('../models/Reviews');
const authRequired = require('../middleware/authMiddleware');
const verifyDeliveredPurchase = require('../middleware/verifyDeliveredPurchaseMiddleware');

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
      const newReview = await Review.create({
        productId,
        userId,
        rating,
        comment
      });

      res.status(201).json(newReview);
    } catch (err) {
      console.error('Review create error:', err);
      res.status(500).json({ error: 'Could not save review.' });
    }
  }
);

module.exports = router;