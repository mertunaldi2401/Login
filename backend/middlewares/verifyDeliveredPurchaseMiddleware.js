const mongoose = require('mongoose');
const Order = require('../models/Order');

const verifyDeliveredPurchase = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = new mongoose.Types.ObjectId(req.params.productId); // new doğru oldu ✅

    console.log('DEBUG - UserID:', userId);
    console.log('DEBUG - ProductID:', productId);

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