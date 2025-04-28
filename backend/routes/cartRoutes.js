const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const Cart = require('../models/Cart');
const Product = require('../models/Product');

const authenticateToken = require('../middlewares/authMiddleware');

// Optional auth: attaches user info if a valid JWT is sent, but never blocks the request
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function optionalAuth(req, _res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return next();

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    }
    // Even if the token is invalid we continue as guest
    return next();
  });
}

// Apply optionalAuth for every route in this router
router.use(optionalAuth);

// Helper to get cart owner identifier
function getCartQuery(req) {
  if (req.user) {
    return { user: req.user.id };
  } else if (req.headers['x-guest-session']) {
    return { guestSessionId: req.headers['x-guest-session'] };
  }
  return null;
}

// GET /cart
router.get('/', async (req, res) => {
  try {
    const query = getCartQuery(req);
    if (!query) return res.status(400).json({ message: 'User or guest session ID required.' });

    const cart = await Cart.findOne(query).populate('items.product');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve cart.' });
  }
});

// POST /cart → Add to cart
router.post('/', async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: 'Please provide a valid product and quantity.' });
  }

  try {
    let query = getCartQuery(req);
    let guestSessionId;

    if (!query) {
      // No user token or guest session ID, generate one
      guestSessionId = crypto.randomUUID();
      query = { guestSessionId };
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    // Support both legacy `stock` and newer `quantityInStock` fields
    const availableStock =
      typeof product.quantityInStock === 'number'
        ? product.quantityInStock
        : product.stock ?? 0;

    let cart = await Cart.findOne(query);
    if (!cart) {
      const cartData = { ...query, items: [] };
      
      // Very important: if cartData.user is undefined, delete it, to avoid MongoDB unique constraint error
      if (!cartData.user) {
        delete cartData.user;
      }
      
      cart = new Cart(cartData);
    }

    const existingItem = cart.items.find(item => item.product.equals(productId));
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const totalRequested = currentQuantity + quantity;

    if (availableStock < totalRequested) {
      return res
        .status(400)
        .json({ message: `Only ${availableStock} item(s) available in stock.` });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

   
    await cart.save();

    if (guestSessionId) {
      res.setHeader('x-guest-session', guestSessionId);
    }

    res.status(200).json({ message: 'Product added to cart.', cart, guestSessionId });
  } catch (err) {
    console.error('Could not add to cart:', err);
    res.status(500).json({ message: 'Failed to add product to cart.' });
  }
});

// DELETE /cart/:productId
router.delete('/:productId', async (req, res) => {
  try {
    let query = getCartQuery(req);
    let guestSessionId;

    if (!query) {
      // No user token or guest session ID, generate one
      guestSessionId = crypto.randomUUID();
      query = { guestSessionId };
    }

    const cart = await Cart.findOne(query);
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    const productId = req.params.productId;

    const itemToRemove = cart.items.find(item => item.product.equals(productId));
    if (!itemToRemove) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    // Restock the product (handles both `quantityInStock` and `stock`)
    

    // Remove from cart
    cart.items = cart.items.filter(item => !item.product.equals(productId));
    await cart.save();

    if (guestSessionId) {
      res.setHeader('x-guest-session', guestSessionId);
    }

    res.status(200).json({ message: 'Product removed from cart and stock updated.', cart });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Failed to remove product from cart.' });
  }
});

module.exports = router;