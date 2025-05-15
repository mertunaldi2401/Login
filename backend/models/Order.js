const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price   : { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'in-transit', 'delivered'],
    default: 'processing'
  },
  // --- Refund alanları (Feature 5) ---
  refundRequested   : { type: Boolean, default: false },
  refundStatus      : { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  refundReason      : { type: String },       // müşterinin sebebi
  refundDecisionNote: { type: String },       // satış yöneticisinin yorumu
  refundDecisionDate: { type: Date }   
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);