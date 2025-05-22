// backend/routes/orderRoutes.js

const express = require('express');
const router  = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const orderController   = require('../controller/orderController');

// Place order
router.post('/', authenticateToken, orderController.placeOrder);

// User order history
router.get('/history', authenticateToken, orderController.getOrderHistory);

// Cancel (processing only)
router.patch('/:id/cancel',   authenticateToken, orderController.cancelOrder);

// Customer refund request
router.patch('/:id/return',   authenticateToken, orderController.returnOrder);

// Sales-manager refund approval
router.patch('/:id/refund',   authenticateToken, orderController.approveRefund);

// Satış yöneticisinin iade taleplerini listele
router.get(
  '/refundRequests',
  authenticateToken,
  orderController.getRefundRequests
);

// Satış yöneticisinin iade talebini onayla / reddet
router.patch(
  '/:id/refund',
  authenticateToken,
  orderController.processRefund
);
module.exports = router;