const Order = require('../models/Order');

module.exports = async function verifyDeliveredPurchase(req, res, next) {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const deliveredOrder = await Order.exists({
      user: userId,
      status: 'delivered',
      'items.product': productId
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        error: 'You can rate or comment only after the product is delivered.'
      });
    }

    next();
  } catch (err) {
    console.error('Delivery‑check error:', err);
    res.status(500).json({ error: 'Server error validating delivery status.' });
  }
};