// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Reviews');
const authRequired = require('../middlewares/authMiddleware');
const verifyDeliveredPurchase = require('../middlewares/verifyDeliveredPurchaseMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

// Yorum ekleme (zaten vardı)
router.post(
  '/:productId/reviews',
  authRequired,
  verifyDeliveredPurchase,
  async (req, res) => {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user._id;

    try {
      const existingReview = await Review.findOne({ productId, userId });
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this product.' });
      }

      const newReview = await Review.create({
        productId,
        userId,
        rating,
        comment,
        approved: false
      });

      res.status(201).json(newReview);
    } catch (err) {
      console.error('Review create error:', err);
      res.status(500).json({ error: 'Could not save review.' });
    }
  }
);

// 🔥 YENİ: Admin review onaylama route
router.put(
  '/:reviewId/approve',
  authRequired,
  adminOnly,
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found.' });
      }
      review.approved = true;
      await review.save();
      res.json({ message: 'Review approved successfully.' });
    } catch (err) {
      console.error('Review approve error:', err);
      res.status(500).json({ error: 'Failed to approve review.' });
    }
  }
);

module.exports = router;