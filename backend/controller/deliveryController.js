const Delivery = require('../models/Delivery');

// GET /deliveries → list everything
exports.listDeliveries = async (req, res, next) => {
  if (req.user.role !== 'product-manager') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const deliveries = await Delivery.find()
    .populate('customer', 'username email')
    .populate('product', 'name')
    .lean();
  res.json(deliveries);
};

// (Optional) PATCH /deliveries/:id/complete → mark as completed
exports.markComplete = async (req, res, next) => {
  // ... role guard, ID validation ...
  const d = await Delivery.findByIdAndUpdate(req.params.id, { completed: true }, { new: true });
  if (!d) return res.status(404).json({ message: 'Not found' });
  res.json(d);
};