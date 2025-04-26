const express = require('express');
const router = express.Router();

const authenticateToken = require('../middlewares/authMiddleware');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { forwardToDeliveryDept } = require('../services/deliveryService');
const { generateInvoicePDF } = require('../services/invoiceService');
const { sendInvoiceEmail } = require('../services/emailService');

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

    
    // ➡️ Generate PDF and send email
    try {
      const populatedOrder = await Order.findById(order._id).populate('items.product');
      const pdfBuffer = await generateInvoicePDF(populatedOrder);
      await sendInvoiceEmail(req.user.id, pdfBuffer);
      console.log('✅ Invoice sent to user successfully.');
    } catch (err) {
      console.error('❌ Error sending invoice email:', err);
    }
    // NEW ❶ – fire‑and‑forget hand‑off to delivery department
    forwardToDeliveryDept(order).catch(console.error);

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

// GET /orders/history → Get current user's orders with status
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('Error fetching order history:', err);
    res.status(500).json({ message: 'Failed to retrieve order history.' });
  }
});


router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['processing', 'in-transit', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'username');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json({ message: 'Order status updated successfully.', order });
  } catch (err) {
    console.error('Order status update error:', err);
    res.status(500).json({ message: 'Failed to update order status.' });
  }
});

// GET /orders/all → Admin panel için tüm siparişleri getir
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ message: 'Failed to retrieve orders.' });
  }
});


// GET /orders/:id/invoice → Generate and download invoice PDF
router.get('/:id/invoice', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const pdfBuffer = await generateInvoicePDF(order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating invoice PDF:', err);
    res.status(500).json({ message: 'Failed to generate invoice PDF' });
  }
});

module.exports = router;
