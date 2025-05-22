const express = require('express');
const router  = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const ctrl    = require('../controller/deliveryController');

router.get('/', authenticateToken, ctrl.listDeliveries);
router.get('/all', authenticateToken, ctrl.listAllDeliveries);
router.patch('/:id/complete', authenticateToken, ctrl.markComplete);

module.exports = router;