const User = require('../models/User');

exports.addToWishlist = async (req, res) => {
  const { userId, productId } = req.body;
  const user = await User.findById(userId);
  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    await user.save();
  }
  res.json(user.wishlist);
};

exports.removeFromWishlist = async (req, res) => {
  const { userId, productId } = req.body;
  const user = await User.findById(userId);
  user.wishlist = user.wishlist.filter(p => p.toString() !== productId);
  await user.save();
  res.json(user.wishlist);
};

exports.getWishlist = async (req, res) => {
  const user = await User.findById(req.params.userId).populate('wishlist');
  res.json(user.wishlist);
};