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

module.exports = router;