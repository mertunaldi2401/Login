const Router   = require('express').Router;
const Review   = require('../models/Reviews');
const auth     = require('../middlewares/authMiddleware');

const router = Router();

// GET /reviews/unapproved  → only product-manager
router.get('/unapproved', auth, async (req, res) => {
  if (req.user.role !== 'product-manager')
    return res.status(403).json({ message: 'Forbidden' });

  const list = await Review.find({ approved: false })
    .populate('productId', 'name')
    .populate('userId', 'username');
  res.json(list);
});
// routes/globalReviewRoutes.js
router.put('/:reviewId/approve', auth, async (req, res) => {
  if (req.user.role !== 'product-manager')
    return res.status(403).json({ message: 'Forbidden' });

  const review = await Review.findById(req.params.reviewId);
  if (!review) return res.status(404).json({ message: 'Review not found.' });

  review.approved = true;
  await review.save();
  res.json({ message: 'Review approved.' });
});

module.exports = router;