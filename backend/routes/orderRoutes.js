const express = require('express');
const router = express.Router();

const authenticateToken = require('../middlewares/authMiddleware');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');
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

    // Extract delivery address
    const { deliveryAddress } = req.body;
    const requiredAddrFields = [
      'firstName',
      'lastName',
      'address',
      'city',
      'postalCode',
      'province',
      'country',
      'phone'
    ];
    if (
      !deliveryAddress ||
      !requiredAddrFields.every(f => typeof deliveryAddress[f] === 'string' && deliveryAddress[f].trim() !== '')
    ) {
      return res.status(400).json({ message: 'Delivery address is incomplete.' });
    }

    // Check stock and calculate total price
    for (const item of cart.items) {
      if (item.quantity > item.product.quantityInStock) {
        return res.status(400).json({ message: `Insufficient stock for: ${item.product.name}` });
      }
      totalPrice += item.quantity * item.product.price;
    }

    // Create the order correctly
    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,    // 🔥 SADECE ID GÖNDER
        quantity: item.quantity,
      })),
      totalPrice, // burada üstte hesapladığın değeri kaydet
      status: 'processing',
      deliveryAddress             // NEW
    });

    await order.save();

    // Generate PDF and send invoice email
    try {
      const populatedOrder = await Order.findById(order._id).populate('items.product');
      const pdfBuffer = await generateInvoicePDF(populatedOrder);
      await sendInvoiceEmail(req.user.id, pdfBuffer, order._id);
      console.log('✅ Invoice sent to user successfully.');
    } catch (err) {
      console.error('❌ Error sending invoice email:', err);
    }

    // Notify delivery department
    forwardToDeliveryDept(order).catch(console.error);

    // Decrease product stocks
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      product.quantityInStock -= item.quantity;
      await product.save();
    }

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully!', order });

    // Client code reminder:
    // In Checkout.js, make sure to post { deliveryAddress: formData }

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

// GET /orders/all → Only product‑manager (or sales‑manager) can list every order
router.get('/all', authenticateToken, async (req, res) => {
  if (req.user.role !== 'product-manager' && req.user.role !== 'sales-manager') {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }

  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ message: 'Failed to retrieve orders.' });
  }
});

// GET /orders/:id → Fetch a single order (for invoice display)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Failed to fetch order.' });
  }
});

router.patch('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStates = ['processing', 'in-transit', 'delivered'];
    if (!validStates.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    // Role guard
    if (req.user.role !== 'product-manager') {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    // Validate ID
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    // Prevent illegal transitions
    const currentIndex = validStates.indexOf(order.status);
    const newIndex = validStates.indexOf(status);
    if (newIndex < currentIndex) {
      return res.status(400).json({ message: `Illegal status transition from "${order.status}" to "${status}".` });
    }
    // Update and respond
    order.status = status;
    await order.save();
    const updated = await Order.findById(id).populate('user', 'username');
    return res.json({ message: 'Order status updated successfully.', order: updated });
  } catch (err) {
    console.error('Order status update error:', err);
    return res.status(500).json({ message: 'Failed to update order status.' });
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

// PATCH /orders/:id/cancel → cancel only when status=processing, restore stock
router.patch('/:id/cancel', authenticateToken, async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  if (order.status !== 'processing') {
    return res.status(400).json({ message: 'Only orders with status “processing” can be cancelled.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Restore product stock
    await Promise.all(
      order.items.map(item =>
        Product.findByIdAndUpdate(item.product, { $inc: { quantityInStock: item.quantity } }, { session })
      )
    );

    // Cancel order
    order.status = 'cancelled';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Order successfully cancelled.', order });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
});

module.exports = router;