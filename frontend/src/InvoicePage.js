// frontend/src/pages/InvoicePage.js

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';

const InvoicePage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const componentRef = useRef();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/orders/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const foundOrder = res.data.find(o => o._id === orderId);
        setOrder(foundOrder);
      } catch (err) {
        console.error('Error fetching order:', err);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Invoice',
  });

  if (!order) {
    return <div>Loading invoice...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div ref={componentRef} style={{
        maxWidth: '700px',
        margin: '0 auto',
        border: '1px solid #ccc',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Invoice</h1>
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>

        <h2 style={{ marginTop: '2rem' }}>Items Purchased</h2>
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Product</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item._id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.product?.name || 'Product'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ marginTop: '2rem' }}>Total Amount</h2>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${order.totalPrice.toFixed(2)}</p>

        <p style={{ marginTop: '2rem', fontStyle: 'italic', textAlign: 'center' }}>
          Thank you for shopping with us!
        </p>
      </div>
    
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={handlePrint} style={{
            padding: '0.7rem 1.5rem',
            background: '#d50000',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
        }}>
            Download Invoice as PDF
         </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
                onClick={() => window.location.href = '/'}
                style={{
                marginTop: '1rem',
                padding: '0.7rem 1.5rem',
                background: '#333',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
                }}
            >
            Back to Home
            </button>
        </div>
      
    </div>
  );
};

export default InvoicePage;