// backend/seeds/seed.js
// Seed script to populate initial data: products, users, and orders

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// MONGO_URI can be set via env or fallback to localhost
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/music_store_demo';

async function seed() {
  try {
    // Connect to MongoDB (Mongoose v6+ handles options internally)
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Order.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('Cleared Products, Users, Orders');

    // Create Products A-H
    const productsData = [
      { name: 'Product A', model: 'A1', description: 'Out of stock product', quantityInStock: 0, price: 100, priceSetBySalesManager: true, category: 'Default', brand: 'BrandA' },
      { name: 'Product B', model: 'B1', description: 'One in stock', quantityInStock: 1, price: 150, priceSetBySalesManager: true, category: 'Default', brand: 'BrandB' },
      { name: 'Product C', model: 'C1', description: 'Multiple in stock', quantityInStock: 5, price: 200, priceSetBySalesManager: true, category: 'Default', brand: 'BrandC' },
      { name: 'Product D', model: 'D1', description: 'To be added by product manager', quantityInStock: 10, price: 0, priceSetBySalesManager: false, category: 'Default', brand: 'BrandD' },
      { name: 'Product E', model: 'E1', description: 'Purchased >1 month ago', quantityInStock: 10, price: 80, category: 'Default', brand: 'BrandE' },
      { name: 'Product F', model: 'F1', description: 'Purchased <1 month ago', quantityInStock: 10, price: 90, category: 'Default', brand: 'BrandF' },
      { name: 'Product G', model: 'G1', description: 'Purchased recently (processing)', quantityInStock: 10, price: 110, category: 'Default', brand: 'BrandG' },
      { name: 'Product H', model: 'H1', description: 'Purchased recently (in-transit)', quantityInStock: 10, price: 120, category: 'Default', brand: 'BrandH' }
    ];
    const products = await Product.insertMany(productsData);
    console.log('Seeded Products');

    // Create Users: customer, product manager, sales manager
    const hashed = await bcrypt.hash('password123', 10);

    const [customer, pm, sm] = await User.insertMany([
      { username: 'customer1', name: 'Demo Customer', taxId: 'TAX12345',
        email: 'customer@example.com', password: hashed, address: '123 Demo St',
        role: 'customer' },
      { username: 'pm1', name: 'Product Manager', taxId: 'TAX54321',
        email: 'pm@example.com', password: hashed, address: '456 Manager Ave',
        role: 'product-manager' },
      { username: 'sm1', name: 'Sales Manager', taxId: 'TAX67890',
        email: 'sm@example.com', password: hashed, address: '789 Sales Rd',
        role: 'sales-manager' }
    ]);
    console.log('Seeded Users');

    // Map products by name for easy reference
    const prodMap = {};
    products.forEach(p => { prodMap[p.name] = p; });

    // Create Orders for the customer
    const now = Date.now();
    const ordersData = [
      // Product E: delivered >1 month ago (~40 days ago)
      {
        user: customer._id,
        items: [{ product: prodMap['Product E']._id, quantity: 1 }],
        totalPrice: prodMap['Product E'].price,
        status: 'delivered',
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 40),
        deliveryAddress: {
          phone: "555-1234",
          country: "Turkey",
          province: "Istanbul",
          postalCode: "34000",
          city: "Istanbul",
          address: "Demo Street 123",
          lastName: "Customer",
          firstName: "Demo"
        }
      },
      // Product F: delivered <1 month ago (~15 days ago)
      {
        user: customer._id,
        items: [{ product: prodMap['Product F']._id, quantity: 1 }],
        totalPrice: prodMap['Product F'].price,
        status: 'delivered',
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 15),
        deliveryAddress: {
          phone: "555-1234",
          country: "Turkey",
          province: "Istanbul",
          postalCode: "34000",
          city: "Istanbul",
          address: "Demo Street 123",
          lastName: "Customer",
          firstName: "Demo"
        }
      },
      // Product G: processing (recent)
      {
        user: customer._id,
        items: [{ product: prodMap['Product G']._id, quantity: 1 }],
        totalPrice: prodMap['Product G'].price,
        status: 'processing',
        createdAt: new Date(now),
        deliveryAddress: {
          phone: "555-1234",
          country: "Turkey",
          province: "Istanbul",
          postalCode: "34000",
          city: "Istanbul",
          address: "Demo Street 123",
          lastName: "Customer",
          firstName: "Demo"
        }
      },
      // Product H: in-transit (recent)
      {
        user: customer._id,
        items: [{ product: prodMap['Product H']._id, quantity: 1 }],
        totalPrice: prodMap['Product H'].price,
        status: 'in-transit',
        createdAt: new Date(now),
        deliveryAddress: {
          phone: "555-1234",
          country: "Turkey",
          province: "Istanbul",
          postalCode: "34000",
          city: "Istanbul",
          address: "Demo Street 123",
          lastName: "Customer",
          firstName: "Demo"
        }
      }
    ];
    await Order.insertMany(ordersData);
    console.log('Seeded Orders');

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error while seeding:', error);
    process.exit(1);
  }
}

seed();