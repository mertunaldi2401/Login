const mongoose = require('mongoose');
const Order = require('../models/Order');

const verifyDeliveredPurchase = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Support both URL param and body payload
    const productIdRaw = req.params.productId || req.body.productId;
    if (!productIdRaw) {
      return res.status(400).json({ message: 'Product ID missing.' });
    }

    const productId = new mongoose.Types.ObjectId(productIdRaw);

    console.log('DEBUG - UserID:', userId);
    console.log('DEBUG - ProductID:', productId);

    // Check if the user has a delivered order containing this product
    const order = await Order.findOne({
      user: userId,
      status: 'delivered',
      'items.product': productId,
    });

    console.log('DEBUG - Found Order:', order);

    if (!order) {
      return res.status(400).json({ message: 'You can comment after you receive your product.' });
    }

    next();
  } catch (error) {
    console.error('verifyDeliveredPurchase error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = verifyDeliveredPurchase;