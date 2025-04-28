const express = require('express');
const router = express.Router();
const Review = require('../models/Reviews');
const authRequired = require('../middlewares/authMiddleware');
const verifyDeliveredPurchase = require('../middlewares/verifyDeliveredPurchaseMiddleware');
const mongoose = require('mongoose');

// Yorum ekleme
router.post(
  '/:productId/reviews',
  authRequired, // Kullanıcı doğrulaması
  verifyDeliveredPurchase, // Ürün teslimatı doğrulaması
  async (req, res) => {
    const { rating, comment } = req.body;
    const { productId } = req.params;
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
        approved: false // Onaylanmamış bir yorum
      });

      res.status(201).json(newReview); // Yeni yorumu döndürüyoruz
    } catch (err) {
      console.error('Review create error:', err);
      res.status(500).json({ error: 'Could not save review.' });
    }
  }
);

// Onaylı yorumları getirme
router.get('/:productId/reviews', async (req, res) => {
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

// Admin review onaylama route
router.put('/:reviewId/approve', async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    review.approved = true; // Onayla
    await review.save(); // Onaylı olarak kaydediyoruz

    res.json({ message: 'Review approved successfully.' });
  } catch (err) {
    console.error('Review approve error:', err);
    res.status(500).json({ error: 'Failed to approve review.' });
  }
});

// Onaylı ve onaysız tüm yorumları getiren bir route (Admin için)
router.get('/:productId/all-reviews', async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ productId }); // Hem onaylı hem de onaysız yorumlar
    res.status(200).json(reviews); // Tüm yorumları gönderiyoruz
  } catch (err) {
    console.error('Error fetching all reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

module.exports = router;