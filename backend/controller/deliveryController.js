const Delivery = require('../models/Delivery');

// GET /deliveries → list everything
const listAllDeliveries = async (req, res, next) => {
  if (
    req.user.role !== 'product-manager' &&
    req.user.role !== 'sales-manager'
  ) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const deliveries = await Delivery.find()
    .populate('customer', 'username email _id')
    .populate('product', 'name _id')
    .lean();

  // Return a flattened array with desired fields
  const formatted = deliveries.map(d => ({
    deliveryId: d._id,
    customerId: d.customer?._id,
    customerName: d.customer?.username,
    productId: d.product?._id,
    productName: d.product?.name,
    quantity: d.quantity,
    totalPrice: d.totalPrice,
    address: d.address,
    completed: d.completed,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt
  }));

  res.json(formatted);
};

exports.listAllDeliveries = listAllDeliveries;
// Alias for backwards compatibility
exports.listDeliveries = listAllDeliveries;

// (Optional) PATCH /deliveries/:id/complete → mark as completed
exports.markComplete = async (req, res, next) => {
  // ... role guard, ID validation ...
  const d = await Delivery.findByIdAndUpdate(req.params.id, { completed: true }, { new: true });
  if (!d) return res.status(404).json({ message: 'Not found' });
  res.json(d);
};