import React, { useEffect, useState } from 'react';
import axios from 'axios';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  };

  useEffect(() => {
    axios
      .get('http://localhost:5001/orders/history', { headers })
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching order history:', err.response?.data || err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ color: '#fff' }}>Loading orders…</p>;

  if (orders.length === 0)
    return <p style={{ color: '#fff' }}>You have no orders yet.</p>;

  return (
    <div style={{ padding: '2rem', color: '#fff' }}>
      <h2>My Orders</h2>
      {orders.map((o) => (
        <div
          key={o._id}
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            border: '1px solid #444',
            borderRadius: '6px'
          }}
        >
          <strong>Order&nbsp;{o._id}</strong> — <em>{o.status}</em>
          <br />
          Ship to:{' '}
          {o.deliveryAddress
            ? `${o.deliveryAddress.address}, ${o.deliveryAddress.city}, ${o.deliveryAddress.province}, ${o.deliveryAddress.country}`
            : 'N/A' }
          <br />
          Items:
          {o.items.map((it) => ` ${it.product.name} (x${it.quantity})`).join(', ')}
          <br />
          Total:&nbsp;${o.totalPrice.toFixed(2)}
        </div>
      ))}
    </div>
  );
}

export default OrderHistory;