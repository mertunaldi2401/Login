require('dotenv').config();   

const express = require('express');
const cors    = require('cors');

const connectDB = require('./db'); // just require, no call yet
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes    = require('./routes/cartRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes  = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const User = require('./models/User');
const Cart = require('./models/Cart');
const Product = require('./models/Product');
const authenticateToken = require('./middlewares/authMiddleware');
const { forwardToDeliveryDept } = require('./services/deliveryService');
const productController = require('./controller/productController');
const adminRoutes = require('./routes/adminRoutes');


const app  = express();
const PORT = process.env.PORT || 5001;          

// ✅ Connect to MongoDB only once
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET);


// Routes
app.use('/auth',    authRoutes);
app.use('/users',   userRoutes);
app.use('/cart',    cartRoutes);
app.use('/orders',  orderRoutes);
app.use('/products',          productRoutes);
// mount product-specific reviews under /products/:productId/reviews
app.use('/products/:productId/reviews', reviewRoutes);
app.use('/admin', adminRoutes);
// Category management endpoints
app.use('/categories', categoryRoutes);
// Delivery list endpoints
app.use('/deliveries', deliveryRoutes);

// Base route for sanity check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅  Server is running on http://localhost:${PORT}`);
});