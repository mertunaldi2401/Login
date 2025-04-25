// backend/services/deliveryService.js
// Very light helper that forwards new orders to the delivery department.
// – If you already have a delivery micro‑service: set DELIVERY_WEBHOOK in .env
// – If not, this is a harmless stub you can extend later.

const axios = require('axios');

const url = process.env.DELIVERY_WEBHOOK;      // e.g. http://delivery-svc:4000/api/ship

/**
 * Forward an order object.  Fire‑and‑forget: errors are logged but won’t
 * block checkout flow.
 */
module.exports.forwardToDeliveryDept = async function forward(order) {
  if (!url) {
    console.warn('💡 DELIVERY_WEBHOOK not set – order not forwarded');
    return;
  }
  try {
    await axios.post(url, order);
  } catch (err) {
    console.error('⚠️  Could not forward order to delivery dept:', err.message);
  }
};