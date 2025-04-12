const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required.'], trim: true },
  model: { type: String },
  serialNumber: { type: String },
  description: { type: String, maxlength: 1000, trim: true },
  quantityInStock: { type: Number, required: true, min: 0, default: 0 },
  price: { type: Number, required: true, min: 0 },
  warrantyStatus: { type: String },
  distributorInfo: { type: String },
  image: { type: String, trim: true },
  category: { type: String, required: true, trim: true },
  brand: { type: String, trim: true },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);