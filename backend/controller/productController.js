const Product = require('../models/Product');

/**
 * GET /products/search?q=...&category=...
 * Full‑text search + optional category filter,
 * sorted by availability then name, excludes __v.
 */
exports.searchProducts = async (req, res) => {
  try {
    const { q, category } = req.query;

    // Build Mongo query pieces
    const textFilter = q ? { $text: { $search: q } } : {};
    const categoryFilter = category ? { category } : {};
    const filter = { ...textFilter, ...categoryFilter };

    const products = await Product.find(filter)
      .sort({ quantityInStock: -1, stock: -1, name: 1 })
      .select('-__v')
      .lean();

    res.json(products);
  } catch (err) {
    console.error('Product search error:', err);
    res.status(500).json({ error: 'Server error searching products.' });
  }
};

/**
 * GET /products?category=...
 * Return all products or by category.
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    resStatus(500).json({ message: 'Error fetching products', error: err.message });
  }
};

/**
 * GET /products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Error retrieving product.' });
  }
};

/**
 * POST /products
 * Create a new product
 */
exports.createProduct = async (req, res) => {
  const {
    name,
    model,
    serialNumber,
    description,
    quantityInStock,
    price,
    warrantyStatus,
    distributorInfo,
    image,
    category,
    brand,
    isFeatured,
    rating,
    numReviews
  } = req.body;

  if (!name || price === undefined || quantityInStock === undefined || !category) {
    return res.status(400).json({
      message: 'Name, price, quantityInStock, and category are required.'
    });
  }

  try {
    const newProduct = new Product({
      name,
      model,
      serialNumber,
      description,
      quantityInStock,
      price,
      warrantyStatus,
      distributorInfo,
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
};

/**
 * GET /products/categories/distinct
 * Unique category list
 */
exports.getDistinctCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
};

/**
 * GET /products/grouped
 * Products grouped by category
 */
exports.getGroupedProducts = async (req, res) => {
  try {
    const groupedProducts = await Product.aggregate([
      { $group: { _id: '$category', products: { $push: '$$ROOT' } } },
      { $project: { _id: 0, category: '$_id', products: 1 } }
    ]);
    res.json(groupedProducts);
  } catch (error) {
    console.error('Error grouping products:', error);
    res.status(500).json({ error: 'Server error grouping products' });
  }
};