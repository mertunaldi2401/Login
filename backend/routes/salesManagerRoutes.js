const express = require("express");
const router = express.Router();
const {
  setProductPrice,
  setDiscount,
  getInvoicesInRange,
  calculateRevenue,
  evaluateRefund
} = require("../controller/salesManagerController");

const verifySalesManager = require("../middlewares/adminMiddleware");

router.put("/set-price/:productId", verifySalesManager, setProductPrice);
router.put("/set-discount/:productId", verifySalesManager, setDiscount);
router.get("/invoices", verifySalesManager, getInvoicesInRange);
router.get("/revenue", verifySalesManager, calculateRevenue);
router.put("/refund/:orderId", verifySalesManager, evaluateRefund);

module.exports = router;