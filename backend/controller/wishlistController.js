
// controller/wishlistController.js
const User = require('../models/User');

/**
 * Get current user's wishlist
 */
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name price');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json(user.wishlist);
  } catch (err) {
    console.error('❌ getWishlist error:', err);
    return res.status(500).json({ message: 'Failed to fetch wishlist.' });
  }
};

/**
 * Add a product to user's wishlist
 */
exports.addToWishlist = async (req, res) => {
  const { productId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.wishlist.some(id => id.toString() === productId)) {
      return res.status(400).json({ message: 'Product already in wishlist.' });
    }

    user.wishlist.push(productId);
    await user.save();
    return res.json({ message: 'Product added to wishlist.' });
  } catch (err) {
    console.error('❌ addToWishlist error:', err);
    return res.status(500).json({ message: 'Failed to add to wishlist.' });
  }
};

/**
 * Remove a product from user's wishlist
 */
exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.wishlist.some(id => id.toString() === productId)) {
      return res.status(400).json({ message: 'Product not in wishlist.' });
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    return res.json({ message: 'Product removed from wishlist.' });
  } catch (err) {
    console.error('❌ removeFromWishlist error:', err);
    return res.status(500).json({ message: 'Failed to remove from wishlist.' });
  }
};