const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const verifyUser = require("../middlewares/authMiddleware");

// Add product to wishlist
router.post("/add/:productId", verifyUser, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user.wishlist.includes(req.params.productId)) {
    user.wishlist.push(req.params.productId);
    await user.save();
  }
  res.json({ wishlist: user.wishlist });
});

// Remove product from wishlist
router.delete("/remove/:productId", verifyUser, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
  await user.save();
  res.json({ wishlist: user.wishlist });
});

// Get wishlist
router.get("/", verifyUser, async (req, res) => {
  const user = await User.findById(req.user.id).populate("wishlist");
  res.json({ wishlist: user.wishlist });
});

module.exports = router;