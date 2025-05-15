const express = require('express');
const router  = express.Router();
const c       = require('../controllers/salesManager');

// Pricing / discount
router.put('/product/:id/price',  c.setProductPrice);

// Invoices
router.get('/invoices',          c.getInvoicesInRange);
router.get('/invoice/:id/pdf',   c.getInvoicePDF);

// Revenue
router.get('/revenue',           c.getRevenueStats);

// Refunds
router.get('/refunds',           c.getRefundRequests);   // list by status
router.patch('/refund/:id',      c.reviewRefund);        // approve / reject

module.exports = router;