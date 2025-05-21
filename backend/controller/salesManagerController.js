const Product = require("../models/Product");
const Order = require("../models/Order");
const { notifyUsersAboutDiscount } = require("../services/emailService");

exports.setProductPrice = async (req, res) => {
  try {
    const { price } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.price = price;
    product.priceSetBySalesManager = true;
    await product.save();

    res.json({ message: "Price set successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.setDiscount = async (req, res) => {
  try {
    const { discountPercentage } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.discountPercentage = discountPercentage;
    await product.save();

    // Notify wishlist users
    await notifyUsersAboutDiscount(product);

    res.json({ message: "Discount applied and notifications sent", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInvoicesInRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const orders = await Order.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate("user").populate("products.product");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.calculateRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const orders = await Order.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).populate("products.product");

    let totalRevenue = 0;
    let totalCost = 0;

    orders.forEach(order => {
      order.products.forEach(p => {
        totalRevenue += p.price * p.quantity;
        totalCost += p.product.costPrice * p.quantity;
      });
    });

    const profit = totalRevenue - totalCost;

    res.json({ totalRevenue, totalCost, profit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.evaluateRefund = async (req, res) => {
  try {
    const { approved } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.refundApproved = approved;
    await order.save();

    res.json({ message: "Refund evaluated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};