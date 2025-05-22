const Order = require('../models/Order');
const Product = require('../models/Product');

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

      // Query orders within range
      const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort({ createdAt: -1 });

      // Map orders to frontend shape (id, totalPrice, createdAt, status, items)
      const orderList = orders.map(order => ({
        id: order._id,
        totalPrice: order.totalPrice || 0,
        createdAt: order.createdAt,
        status: order.status,
        items: order.items // include items if needed
      }));

      // Log to help debugging in console
      console.log("Orders returned:", orderList);

      res.json(orderList);
    } catch (err) {
      console.error('Order fetch error:', err);
      res.status(500).json({ message: 'Server error.' });
    }
};

// --- Refund Requests Section ---

const RefundRequest = require('../models/RefundRequest');
const User = require('../models/User');

// Show all pending refund requests (optionally filter for Product F)
exports.getRefundRequests = async (req, res) => {
  if (!req.user || req.user.role !== 'sales-manager') {
    return res.status(403).json({ message: 'Forbidden: Only sales managers can view refund requests.' });
  }
  try {
    // To filter for Product F only, add { product: "<Product_F_ID>" } inside the query below
    const refunds = await RefundRequest.find({ status: 'pending' })
      .populate('product')
      .populate('customer');
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching refunds.' });
  }
};

// Approve a refund request, update stock, notify customer
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

    // Update product stock
    const product = refund.product;
    product.quantityInStock += 1; // Adjust if 1 unit per refund
    await product.save();

    // Notify customer (add notification object)
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
    // Parse date range from query parameters, fallback to this month if not provided
    const { start, end } = req.query;
    const startDate = start ? new Date(start) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = end ? new Date(end) : new Date();

    // Aggregate invoices in date range
    const invoices = await Invoice.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      status: { $ne: 'cancelled' }
    });

    // Organize by date (YYYY-MM-DD)
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

    // Format result
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