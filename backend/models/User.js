// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  taxId: { type: String, unique: false, sparse: true },
  password: {
    type: String,
    required: true
  },
  // ADD THIS FIELD:
  role: {
    type: String,
    enum: ['customer', 'product-manager', 'sales-manager'],
    required: true
  },
  // Optional: name and address (since your seed uses them)
  name: { type: String },
  address: { type: String },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]

});

module.exports = mongoose.model('User', UserSchema);