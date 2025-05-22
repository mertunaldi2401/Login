const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String }, // Optional, for easy referencing at invoice time
  price: { type: Number, required: true }, // Sale price per unit
  cost: { type: Number, required: true },  // Cost per unit
  quantity: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [invoiceItemSchema],
  total: { type: Number, required: true }, // Grand total
  paymentStatus: { type: String, default: 'paid' }, // paid, pending, refunded, etc.
  status: { type: String, default: 'active' }, // active, refunded, cancelled
  createdAt: { type: Date, default: Date.now, index: true }
  // You can add refundedAmount, refunds: [], etc. as needed
});

module.exports = mongoose.model('Invoice', invoiceSchema);