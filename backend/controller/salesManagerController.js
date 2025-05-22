const Product = require('../models/Product');
const Order   = require('../models/Order');
const User    = require('../models/User');

exports.setProductPrice = async (req, res) => {
  const { price } = req.body;
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Not found' });

  product.price = price;
  product.discountPercentage = 0;
  product.originalPrice = null;
  await product.save();
  res.json(product);
};

exports.setDiscount = async (req, res) => {
  const { discountPercentage } = req.body;
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Not found' });

  if (product.originalPrice === null) product.originalPrice = product.price;
  product.discountPercentage = discountPercentage;
  product.price = Math.round(product.originalPrice * (1 - discountPercentage / 100) * 100) / 100;
  await product.save();

  res.json(product);
};

exports.getInvoicesInRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  const orders = await Order.find({ createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } });
  res.json(orders);
};

exports.calculateRevenue = async (req, res) => {
  const { startDate, endDate } = req.query;
  const orders = await Order.find({ createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } });
  let revenue = 0, cost = 0;
  orders.forEach(o => {
    revenue += o.totalPrice;
    cost += o.totalPrice * 0.5;
  });
  res.json({ totalRevenue: revenue, profit: revenue - cost });
};