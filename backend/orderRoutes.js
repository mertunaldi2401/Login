const express = require('express');
const router = express.Router();

const authenticateToken = require('./authMiddleware');
const Cart = require('./Cart');
const Product = require('./Product');
const Order = require('./Order');

// POST /orders → Place an order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty. Order could not be created.' });
    }

    let totalPrice = 0;

    // Check stock and calculate total price
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({ message: `Insufficient stock for: ${item.product.name}` });
      }
      totalPrice += item.quantity * item.product.price;
    }

    // Create the order
    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      totalPrice
    });

    await order.save();

    // Decrease product stocks
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      product.stock -= item.quantity;
      await product.save();
    }

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ message: 'Failed to create order.' });
  }
});

module.exports = router;