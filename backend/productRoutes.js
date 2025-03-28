const express = require('express');
const router = express.Router();
const Product = require('./Product');

// GET /products - fetch all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

// POST /products - create a new product
router.post('/products', async (req, res) => {
  const {
    name,
    description,
    price,
    stock,
    image,
    category,
    brand,
    isFeatured,
    rating,
    numReviews
  } = req.body;

  // Basic validation
  if (!name || price === undefined || stock === undefined || !category) {
    return res.status(400).json({
      message: 'Name, price, stock, and category are required.'
    });
  }

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      image,
      category,
      brand,
      isFeatured,
      rating,
      numReviews
    });

    await newProduct.save();
    res.status(201).json({
      message: 'Product created successfully!',
      product: newProduct
    });
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({
      message: 'Error creating product',
      error: err.message,
      details: err.errors  
    });
  }
});

module.exports = router;