const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/Reviews');
const Product = require('../models/Product');
const authRequired = require('../middlewares/authMiddleware');
const verifyDeliveredPurchase = require('../middlewares/verifyDeliveredPurchaseMiddleware');
const mongoose = require('mongoose');

// Yorum ekleme
router.post(
  '/',
  authRequired, // Kullanıcı doğrulaması
  verifyDeliveredPurchase, // Ürün teslimatı doğrulaması
  async (req, res) => {
    const { rating, comment } = req.body;
    const hasComment = comment && comment.trim().length > 0;
    const productId = req.params.productId || req.body.productId;
    const userId = req.user.id; // req.user.id doğrulama middleware'inden geliyor

    try {
      // Aynı kullanıcı ve ürünle daha önce bir yorum yapılmış mı?
      const existingReview = await Review.findOne({ productId, userId });
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this product.' });
      }

      // Yeni yorumu veritabanına ekliyoruz
      const newReview = await Review.create({
        productId: new mongoose.Types.ObjectId(productId),
        userId: new mongoose.Types.ObjectId(userId),
        rating,
        comment,
        approved: !hasComment // Yorum yoksa (sadece puan) otomatik onayla
      });

      // Eğer otomatik onaylandıysa ürünün rating ve numReviews alanlarını güncelle
      if (newReview.approved) {
        const approvedReviews = await Review.find({ productId, approved: true });
        const numReviews = approvedReviews.length;
        const avgRating =
          approvedReviews.reduce((sum, r) => sum + r.rating, 0) / numReviews;

        await Product.findByIdAndUpdate(productId, {
          rating: avgRating,
          numReviews
        });
      }

      const message = hasComment
        ? 'Review submitted! Waiting for admin approval.'
        : 'Rating saved successfully.';
      res.status(201).json({ review: newReview, message });
    } catch (err) {
      console.error('Review create error:', err);
      res.status(500).json({ error: 'Could not save review.' });
    }
  }
);

// Onaylı yorumları getirme
router.get('/', async (req, res) => {
  const { productId } = req.params;

  try {
    // Onaylı yorumları sadece getiriyoruz
    const reviews = await Review.find({ productId, approved: true });
    res.status(200).json(reviews);  // Yalnızca onaylı yorumları gönderiyoruz
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// Get all unapproved reviews for Admin
router.get(
  '/unapproved',
  authRequired,
  async (req, res, next) => {
    // Role guard
    if (req.user.role !== 'product-manager') {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    try {
      const reviews = await Review.find({ approved: false })
        .populate('productId', 'name')
        .populate('userId', 'username');
      res.status(200).json(reviews);
    } catch (err) {
      console.error('Error fetching unapproved reviews:', err);
      res.status(500).json({ error: 'Failed to fetch unapproved reviews.' });
    }
  }
);

// Admin review approval route
router.put(
  '/:reviewId/approve',
  authRequired,
  async (req, res, next) => {
    // Role guard
    if (req.user.role !== 'product-manager') {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
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

// Admin review disapproval route
router.put(
  '/:reviewId/disapprove',
  authRequired,
  async (req, res, next) => {
    // Role guard
    if (req.user.role !== 'product-manager') {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    try {
      const review = await Review.findById(req.params.reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found.' });
      }
      review.approved = false;
      await review.save();
      res.json({ message: 'Review disapproved successfully.' });
    } catch (err) {
      console.error('Review disapprove error:', err);
      res.status(500).json({ error: 'Failed to disapprove review.' });
    }
  }
);

// Get all reviews (approved and unapproved) for Admin
router.get(
  '/:productId/all-reviews',
  authRequired,
  async (req, res, next) => {
    // Role guard
    if (req.user.role !== 'product-manager') {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    const { productId } = req.params;
    try {
      const reviews = await Review.find({ productId }); // Hem onaylı hem de onaysız yorumlar
      res.status(200).json(reviews); // Tüm yorumları gönderiyoruz
    } catch (err) {
      console.error('Error fetching all reviews:', err);
      res.status(500).json({ error: 'Failed to fetch reviews.' });
    }
  }
);

module.exports = router;