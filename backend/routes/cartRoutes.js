const express = require('express');
const router = express.Router();

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authenticateToken = require('../middlewares/authMiddleware');

// GET /cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve cart.' });
  }
});

// POST /cart → Add to cart
router.post('/', authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: 'Please provide a valid product and quantity.' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.equals(productId));
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const totalRequested = currentQuantity + quantity;

    if (product.stock < totalRequested) {
      return res.status(400).json({ message: `Only ${product.stock} items available in stock.` });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(200).json({ message: 'Product added to cart.', cart });
  } catch (err) {
    console.error('Could not add to cart:', err);
    res.status(500).json({ message: 'Failed to add product to cart.' });
  }
});

// DELETE /cart/:productId
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    const productId = req.params.productId;

    const itemToRemove = cart.items.find(item => item.product.equals(productId));
    if (!itemToRemove) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    // Restock the product
    const product = await Product.findById(productId);
    if (product) {
      product.stock += itemToRemove.quantity;
      await product.save();
    }

    // Remove from cart
    cart.items = cart.items.filter(item => !item.product.equals(productId));
    await cart.save();

    res.status(200).json({ message: 'Product removed from cart and stock updated.', cart });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Failed to remove product from cart.' });
  }
});

module.exports = router;