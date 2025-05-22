const express = require('express');
const router = express.Router();
const salesManagerController = require('../controller/salesManagerController');
const authenticateToken = require('../middlewares/authMiddleware');

// Apply discount to products (POST /api/salesmanager/apply-discount)
router.post('/apply-discount', authenticateToken, salesManagerController.applyDiscount);

// Get invoices within a date range (GET /api/salesmanager/invoices?start=YYYY-MM-DD&end=YYYY-MM-DD)
router.get('/invoices', authenticateToken, salesManagerController.getInvoicesByDate);

// List pending refund requests
router.get('/refunds', authenticateToken, salesManagerController.getRefundRequests);

// Approve refund request
router.patch('/refunds/:id/approve', authenticateToken, salesManagerController.approveRefund);

// Revenue/profit chart
router.get('/revenue', authenticateToken, salesManagerController.getRevenueChartData);

module.exports = router;