const Order = require('../models/Order');
const Product = require('../models/Product');
const RefundRequest = require('../models/RefundRequest');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

// POST /api/salesmanager/apply-discount
exports.applyDiscount = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'sales-manager') {
      return res.status(403).json({ message: 'Forbidden: Only sales managers can apply discounts.' });
    }

    const { discounts } = req.body;
    if (!Array.isArray(discounts) || discounts.length === 0) {
      return res.status(400).json({ message: 'No discounts provided.' });
    }

    const results = [];
    for (const disc of discounts) {
      const { productId, rate } = disc;
      if (!productId || typeof rate !== 'number' || rate <= 0 || rate >= 100) {
        results.push({ productId, status: 'error', message: 'Invalid productId or rate.' });
        continue;
      }
      const product = await Product.findById(productId);
      if (!product) {
        results.push({ productId, status: 'error', message: 'Product not found.' });
        continue;
      }
      product.price = Math.round(product.price * (1 - rate / 100));
      await product.save();
      results.push({ productId, status: 'success', newPrice: product.price });
    }

    res.json({ message: 'Discounts processed.', results });
  } catch (err) {
    console.error('Discount error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/salesmanager/invoices?start=YYYY-MM-DD&end=YYYY-MM-DD
exports.getInvoicesByDate = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'sales-manager') {
      return res.status(403).json({ message: 'Forbidden: Only sales managers can view invoices.' });
    }
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: 'Start and end date required.' });
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    const invoices = await Invoice.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' }
    }).sort({ createdAt: -1 }).populate('customer');

    const result = invoices.map(inv => ({
      _id: inv._id,
      createdAt: inv.createdAt,
      total: inv.total,
      customer: inv.customer,
      items: inv.items || []
    }));

    res.json(result);
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getRefundRequests = async (req, res) => {
  if (!req.user || req.user.role !== 'sales-manager') {
    return res.status(403).json({ message: 'Forbidden: Only sales managers can view refund requests.' });
  }
  try {
    const refunds = await RefundRequest.find({ status: 'pending' })
      .populate('product')
      .populate('customer');
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching refunds.' });
  }
};

exports.approveRefund = async (req, res) => {
  if (!req.user || req.user.role !== 'sales-manager') {
    return res.status(403).json({ message: 'Forbidden: Only sales managers can approve refunds.' });
  }
  try {
    const refund = await RefundRequest.findById(req.params.id).populate('product customer');
    if (!refund || refund.status !== 'pending') {
      return res.status(404).json({ message: 'Refund request not found or already processed.' });
    }
    refund.status = 'approved';
    await refund.save();

    const product = refund.product;
    product.quantityInStock += 1;
    await product.save();

    const customer = refund.customer;
    customer.notifications = customer.notifications || [];
    customer.notifications.push({
      type: 'refund-approved',
      product: product._id,
      message: `Your refund for product ${product.name} has been approved.`,
      date: new Date()
    });
    await customer.save();

    res.json({ message: 'Refund approved, stock updated, customer notified.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error approving refund.' });
  }
};

exports.getRevenueChartData = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = start ? new Date(start) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = end ? new Date(end) : new Date();

    const invoices = await Invoice.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      status: { $ne: 'cancelled' }
    });

    const daily = {};

    invoices.forEach(inv => {
      const d = inv.createdAt.toISOString().substring(0, 10);
      if (!daily[d]) daily[d] = { revenue: 0, profit: 0 };
      let totalCost = 0;
      inv.items.forEach(item => {
        totalCost += (item.cost || 0) * item.quantity;
      });
      daily[d].revenue += inv.total;
      daily[d].profit += (inv.total - totalCost);
    });

    const result = Object.entries(daily).map(([date, data]) => ({
      date,
      revenue: Number(data.revenue.toFixed(2)),
      profit: Number(data.profit.toFixed(2))
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json(result);
  } catch (err) {
    console.error('Error generating revenue/profit chart:', err);
    res.status(500).json({ error: 'Server error generating chart.' });
  }
};
