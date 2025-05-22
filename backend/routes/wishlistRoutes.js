//routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controller/wishlistController');

router.use(authenticateToken);
router.get('/',          getWishlist);
router.post('/:productId',   addToWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;