// frontend/src/InvoicePage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function InvoicePage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Important for downloading files
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  useEffect(() => {
    async function fetchOrder() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5001/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(res.data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  // Auto-download invoice PDF after 2 seconds
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5001/orders/${orderId}/invoice`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error('❌ Failed to auto-download invoice:', error);
      }
    }, 2000); // 2 seconds delay
    return () => clearTimeout(timer);
  }, [orderId]);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'white', background: 'black' }}>Loading invoice...</div>;
  }

  if (!order) {
    return <div style={{ padding: '2rem', color: 'red', background: 'black' }}>Invoice not found.</div>;
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: 'black', color: 'white', fontFamily: '"Metal Mania", cursive' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem' }}>THOR'S MIGHTY GUITAR STORE</h1>
      <h2 style={{ textAlign: 'center', marginTop: '1rem' }}>Invoice</h2>

      <div style={{ marginTop: '2rem' }}>
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>

        <h3 style={{ marginTop: '1.5rem' }}>Items:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {order.items.map((item, index) => (
            <li key={index} style={{ marginBottom: '0.75rem' }}>
              {item.product?.name || 'Unknown Product'} — Quantity: {item.quantity}
            </li>
          ))}
        </ul>

        <h2 style={{ marginTop: '2rem' }}>Total Price: ${order.totalPrice.toFixed(2)}</h2>
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={handleDownloadInvoice}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#d50000',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Download Invoice PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoicePage;