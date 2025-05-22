const express = require("express");
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const {
  setProductPrice,
  setDiscount,
  getInvoicesInRange,
  calculateRevenue,
  evaluateRefund
} = require("../controller/salesManagerController");

const {
  getRefundRequests,
  processRefund
} = require('../controllers/orderController');

const verifySalesManager = require("../middlewares/adminMiddleware");

router.put("/set-price/:productId", verifySalesManager, setProductPrice);
router.put("/set-discount/:productId", verifySalesManager, setDiscount);
router.get("/invoices", verifySalesManager, getInvoicesInRange);
router.get("/revenue", verifySalesManager, calculateRevenue);
router.put("/refund/:orderId", verifySalesManager, evaluateRefund);
// everything here requires a valid JWT
router.use(authenticateToken);

// GET  /salesmanager/refunds         → list all pending refund requests
router.get('/refunds', getRefundRequests);

// PATCH /salesmanager/refunds/:id    → approve or deny one
router.patch('/refunds/:id', processRefund);


module.exports = router;