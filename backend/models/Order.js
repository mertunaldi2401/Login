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
  }
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
  deliveryAddress: {
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    address:    { type: String, required: true, trim: true },
    city:       { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    province:   { type: String, required: true, trim: true },
    country:    { type: String, required: true, trim: true },
    phone:      { type: String, required: true, trim: true }
  },
  status: {
    type: String,
    enum: ['processing', 'in-transit', 'delivered', 'cancelled'],
    default: 'processing'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);