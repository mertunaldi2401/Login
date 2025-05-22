// backend/controllers/orderController.js

const mongoose               = require('mongoose');
const Cart                   = require('../models/Cart');
const Product                = require('../models/Product');
const Order                  = require('../models/Order');
const { forwardToDeliveryDept } = require('../services/deliveryService');
const { generateInvoicePDF }    = require('../services/invoiceService');
const { sendInvoiceEmail, sendRefundEmail } = require('../services/emailService');


// 1) Place Order
exports.placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty. Order could not be created.' });
    }

    // Stock check + total
    let totalPrice = 0;
    for (const item of cart.items) {
      if (item.quantity > item.product.quantityInStock) {
        return res.status(400).json({ message: `Insufficient stock for: ${item.product.name}` });
      }
      totalPrice += item.quantity * item.product.price;
    }

    // Create Order
    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      totalPrice,
      status: 'processing'
    });
    await order.save();

    // Send invoice email
    try {
      const fullOrder = await Order.findById(order._id).populate('items.product');
      const pdf       = await generateInvoicePDF(fullOrder);
      await sendInvoiceEmail(req.user.id, pdf, order._id);
    } catch (err) {
      console.error('❌ Invoice email error:', err);
    }

    // Forward to delivery
    forwardToDeliveryDept(order).catch(console.error);

    // Decrease stock
    for (const item of cart.items) {
      const p = await Product.findById(item.product._id);
      p.quantityInStock -= item.quantity;
      await p.save();
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ message: 'Failed to create order.' });
  }
};


// 2) Get Order History
exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching order history:', err);
    res.status(500).json({ message: 'Failed to retrieve order history.' });
  }
};


// 3) Cancel Order (only processing)
exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  const order = await Order.findById(id).populate('items.product');
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  if (order.status !== 'processing') {
    return res.status(400).json({ message: 'Only processing orders can be cancelled.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Restore stock
    await Promise.all(order.items.map(item =>
      Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { quantityInStock: item.quantity } },
        { session }
      )
    ));

    order.status = 'refunded';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({ message: 'Order cancelled and stock restored.', order });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Cancel order error:', err);
    return res.status(500).json({ message: 'Failed to cancel order.' });
  }
};


// 4) Customer requests a refund
exports.returnOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Only in-transit or delivered can request refund
    if (!['in-transit', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot request refund at this stage.' });
    }

    // If already delivered, enforce 30-day window using updatedAt
    if (order.status === 'delivered') {
      const nowMs       = Date.now();
      const deliveredMs = new Date(order.updatedAt).getTime();
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      if (nowMs - deliveredMs > THIRTY_DAYS) {
        return res
          .status(400)
          .json({ message: 'Refund window (30 days after delivery) has expired.' });
      }
    }

    order.refundRequested = true;
    await order.save();

    res.json({ message: 'Refund requested successfully.', order });
  } catch (err) {
    console.error('Return order error:', err);
    res.status(500).json({ message: 'Failed to request refund.' });
  }
};


// 5) Sales manager approves refund
exports.approveRefund = async (req, res) => {
  try {
    if (req.user.role !== 'sales-manager') {
      return res.status(403).json({ message: 'Forbidden: insufficient role.' });
    }

    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    if (!order.refundRequested) {
      return res.status(400).json({ message: 'No refund requested.' });
    }

    // Approve
    order.refundApproved = true;
    order.status         = 'refunded';
    await order.save();

    // Restock
    for (const item of order.items) {
      const p = await Product.findById(item.product._id);
      p.quantityInStock += item.quantity;
      await p.save();
    }

    // Notify customer
    await sendRefundEmail(order.user, order._id);

    res.json({ message: 'Refund approved, stock updated, customer notified.', order });
  } catch (err) {
    console.error('Approve refund error:', err);
    res.status(500).json({ message: 'Failed to approve refund.' });
  }
};


// 6) Fetch refund requests for sales manager
exports.getRefundRequests = async (req, res) => {
  if (req.user.role !== 'sales-manager') {
    return res.status(403).json({ message: 'Forbidden: insufficient role.' });
  }
  try {
    const requests = await Order.find({
      refundRequested: true,
      refundApproved:  { $exists: false }
    })
      .populate('user', 'username email')
      .populate('items.product', 'name price');

    res.json(requests);
  } catch (err) {
    console.error('Fetch refund requests error:', err);
    res.status(500).json({ message: 'Failed to fetch refund requests.' });
  }
};


// 7) Sales manager processes refund (approve/deny)
exports.processRefund = async (req, res) => {
  if (req.user.role !== 'sales-manager') {
    return res.status(403).json({ message: 'Forbidden: insufficient role.' });
  }
  const { approved } = req.body;
  const { id }       = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  try {
    const order = await Order.findById(id).populate('items.product');
    if (!order || !order.refundRequested) {
      return res.status(400).json({ message: 'No pending refund request.' });
    }

    order.refundApproved = approved;
    order.status         = approved ? 'refunded' : order.status;
    await order.save();

    if (approved) {
      // Restock
      await Promise.all(order.items.map(item =>
        Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { quantityInStock: item.quantity } }
        )
      ));
      // Notify customer
      await sendRefundEmail(order.user, order._id);
    }

    res.json({
      message: approved
        ? 'Refund approved, stock updated.'
        : 'Refund denied.',
      order
    });
  } catch (err) {
    console.error('Process refund error:', err);
    res.status(500).json({ message: 'Failed to process refund.' });
  }
};
