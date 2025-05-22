require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(cors());
app.use(express.json());
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET);

// ROUTES
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/products', productRoutes);
app.use('/products/:productId/reviews', reviewRoutes);
app.use('/admin', adminRoutes);
app.use('/categories', categoryRoutes);
app.use('/deliveries', deliveryRoutes);
app.use('/wishlist', wishlistRoutes);
app.get('/', (req, res) => res.send('API is running...'));
app.use('/reviews', require('./routes/globalReviewRoutes'));
app.use('/api/salesmanager', require('./routes/salesManagerRoutes'));

app.listen(PORT, () => {
  console.log(`✅  Server is running on http://localhost:${PORT}`);
});