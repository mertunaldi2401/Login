const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  customer:     { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  product:      { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
  quantity:     { type: Number, required: true, min: 1 },
  totalPrice:   { type: Number, required: true, min: 0 },
  address:      { type: String, required: true, trim: true },
  completed:    { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);