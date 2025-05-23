const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const Invoice = require('../models/Invoice');

// GET /api/invoices?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/', authenticateToken, async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ message: 'Start and end dates are required.' });
  }

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); // include the entire end day

    const invoices = await Invoice.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate('customer', 'username email')
      .lean();

    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

module.exports = router;
