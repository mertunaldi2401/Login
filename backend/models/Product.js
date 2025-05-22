// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  model:            { type: String },
  description:      { type: String, maxlength: 1000, trim: true },
  quantityInStock:  { type: Number, required: true, min: 0, default: 0 },
  price:            { type: Number, required: true, min: 0 },

  // ← NEW
  originalPrice:      { type: Number, default: null },  // stored once when a discount is first applied
  discountPercentage: { type: Number, default: 0 },     // active discount %

  costPrice: {                                       // renamed for clarity
    type:    Number,
    required:true,
    min:     0,
    default: function() { return this.price / 2; }
  },

  image:            { type: String, trim: true },
  category:         { type: String, required: true, trim: true },
  brand:            { type: String, trim: true },
  rating:           { type: Number, default: 0, min: 0, max: 5 },
  numReviews:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
