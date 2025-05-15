const Product = require('../models/Product');
const Order   = require('../models/Order');
const { handlePriceChange }  = require('../services/priceChangeHandler');
const { generateInvoicePDF } = require('../services/invoiceService');

// -----------------------------
// 1) Set / update product price
// -----------------------------
async function setProductPrice(req, res) {
  try {
    const { id } = req.params;
    const { price } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.discounted    = price < product.price;
    product.previousPrice = product.price;
    product.price         = price;
    product.isPriced      = true;

    await product.save();
    await handlePriceChange(product._id, price);

    res.json({ message: 'Price set successfully', product });
  } catch (err) {
    console.error('setProductPrice error:', err);
    res.status(500).json({ message: 'Server error setting price' });
  }
}

// -----------------------------
// 2) Invoices (range + PDF)
// -----------------------------
async function getInvoicesInRange(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const orders = await Order.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).populate('items.product');

    res.json(orders);
  } catch (err) {
    console.error('getInvoicesInRange error:', err);
    res.status(500).json({ message: 'Server error fetching invoices' });
  }
}

async function getInvoicePDF(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const pdf = await generateInvoicePDF(order);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order._id}.pdf`);
    res.send(pdf);
  } catch (err) {
    console.error('getInvoicePDF error:', err);
    res.status(500).json({ message: 'Server error generating invoice PDF' });
  }
}

// -----------------------------
// 3) Revenue statistics
// -----------------------------
async function getRevenueStats(req, res) {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ message: 'startDate and endDate required' });

    const matchStage = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };

    let groupId;
    if (groupBy === 'none') groupId = null;
    else if (groupBy === 'month') groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    else groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };

    const pipeline = [
      { $match: matchStage },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'prod' } },
      { $unwind: '$prod' },
      { $group: {
          _id: groupId,
          revenue: { $sum: { $multiply: [ '$items.quantity', '$items.price' ] } },
          cost:    { $sum: { $multiply: [ '$items.quantity', '$prod.cost' ] } }
      } },
      { $project: { _id: 0, period: '$_id', revenue: 1, cost: 1, profit: { $subtract: [ '$revenue', '$cost' ] } } },
      { $sort: { 'period.year': 1, 'period.month': 1, 'period.day': 1 } }
    ];

    const data = await Order.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    console.error('getRevenueStats error:', err);
    res.status(500).json({ message: 'Server error calculating revenue' });
  }
}

// -----------------------------
// 4) Refund evaluation (Feature 5)
// -----------------------------
async function getRefundRequests(req, res) {
  try {
    const { status = 'pending' } = req.query; // pending | approved | rejected
    const orders = await Order.find({ refundRequested: true, refundStatus: status }).populate('items.product');
    res.json(orders);
  } catch (err) {
    console.error('getRefundRequests error:', err);
    res.status(500).json({ message: 'Server error fetching refunds' });
  }
}

async function reviewRefund(req, res) {
  try {
    const { id } = req.params;              // orderId
    const { decision, comment } = req.body; // "approved" | "rejected"

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'decision must be "approved" or "rejected"' });
    }

    const order = await Order.findById(id);
    if (!order || !order.refundRequested) return res.status(404).json({ message: 'Refund request not found' });

    order.refundStatus       = decision;
    order.refundDecisionNote = comment || '';
    order.refundDecisionDate = new Date();
    await order.save();

    res.json({ message: `Refund ${decision}`, order });
  } catch (err) {
    console.error('reviewRefund error:', err);
    res.status(500).json({ message: 'Server error reviewing refund' });
  }
}

module.exports = {
  setProductPrice,
  getInvoicesInRange,
  getInvoicePDF,
  getRevenueStats,
  getRefundRequests,
  reviewRefund
};