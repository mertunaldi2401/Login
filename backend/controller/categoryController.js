// controller/categoryController.js
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

// POST /categories
exports.createCategory = async (req, res, next) => {

  console.log('req.user:', req.user);
  if (req.user.role !== 'product-manager') {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }

  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Invalid category name.' });
  }

  try {
    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'Category already exists.' });
    }
    const category = await Category.create({ name });
    res.status(201).json({ message: 'Category created.', category });
  } catch (err) {
    next(err);
  }
};

// controller/categoryController.js
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// DELETE /categories/:id
exports.deleteCategory = async (req, res, next) => {
  if (req.user.role !== 'product-manager') {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Category not found.' });
  }

  try {
    // Make sure no product references this category
    const inUse = await Product.exists({ category: await Category.findById(id).then(c => c?.name) });
    if (inUse) {
      return res.status(400).json({ message: 'Cannot delete a category that is in use.' });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    next(err);
  }
};