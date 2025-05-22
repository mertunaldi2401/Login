import React, { useState, useEffect, useContext } from 'react';
import jsPDF from 'jspdf';
import Chart from 'chart.js/auto';
import './SalesManager.css'; // ✅ Import CSS
import { AuthContext } from './AuthContext';

function SalesManager() {
  const { auth } = useContext(AuthContext);
  const token = auth.token || localStorage.getItem('token');
  const authHeader = { Authorization: `Bearer ${token}` };

  const [discounts, setDiscounts] = useState([{ productId: '', rate: '' }]);
  const [invoices, setInvoices] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [revenueData, setRevenueData] = useState([]);

  const [unpricedProducts, setUnpricedProducts] = useState([]);
  const [newPrices, setNewPrices] = useState({});
  const [refunds, setRefunds] = useState([]);
  const [products, setProducts] = useState([]);
  const [discountInputs, setDiscountInputs] = useState({});

  useEffect(() => {
    const fetchUnpriced = async () => {
      try {
        const res = await fetch('http://localhost:5001/products/unpriced', {
          headers: authHeader
        });
        const unpriced = await res.json();
        setUnpricedProducts(unpriced);
      } catch (err) {
        console.error('Failed to fetch unpriced products:', err);
        setUnpricedProducts([]);
      }
    };
    fetchUnpriced();

    const fetchRefunds = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/salesmanager/refund-requests', { headers: authHeader });
        const data = await res.json();
        setRefunds(data);
      } catch (err) {
        setRefunds([]);
      }
    };
    fetchRefunds();

    const fetchAllProducts = async () => {
      try {
        const res = await fetch('http://localhost:5001/products', { headers: authHeader });
        const data = await res.json();
        setProducts(data);

        const initialDiscounts = {};
        data.forEach(p => {
          initialDiscounts[p._id] = p.discountPercentage || '';
        });
        setDiscountInputs(initialDiscounts);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchAllProducts();
  }, []);

  const handleDiscountUpdate = async (productId) => {
    const discount = Number(discountInputs[productId]);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      alert('Enter a valid discount (0–100)');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5001/products/${productId}/discount`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({ discountPercentage: discount })
      });

      if (res.ok) {
        alert('Discount saved!');
      } else {
        alert('Failed to apply discount.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  const fetchInvoices = async () => {
    const res = await fetch(`/api/salesmanager/invoices?start=${startDate}&end=${endDate}`, {
      headers: authHeader
    });
    const data = await res.json();
    setInvoices(data);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    invoices.forEach((inv, i) => doc.text(`${i + 1}. ${inv.id} - $${inv.total}`, 10, 10 + i * 10));
    doc.save('invoices.pdf');
  };

  const calculateRevenue = async () => {
    const res = await fetch(`/api/salesmanager/revenue?start=${startDate}&end=${endDate}`, {
      headers: authHeader
    });
    const data = await res.json();
    setRevenueData(data);

    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (window.revenueChartInstance) {
      window.revenueChartInstance.destroy();
    }

    window.revenueChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [
          {
            label: 'Revenue',
            data: data.map(d => d.revenue),
            borderColor: 'green',
            fill: false
          },
          {
            label: 'Profit',
            data: data.map(d => d.profit),
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  };

  const handlePriceChange = (productId, value) => {
    setNewPrices(prev => ({ ...prev, [productId]: value }));
  };

  const handleSetPrice = async (productId) => {
    const price = Number(newPrices[productId]);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid non-negative price.');
      return;
    }
    try {
      await fetch(`http://localhost:5001/products/${productId}/set-price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({ price })
      });
      alert('Price set successfully!');
      setUnpricedProducts(unpricedProducts.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Failed to set price:', err);
      alert('Error setting price.');
    }
  };

  return (
    <div className="sales-manager-container">
      <h2>Sales Manager Dashboard</h2>

      <div style={{ marginTop: '2rem' }}>
        <h3>Set Discounts</h3>
        {products.map(product => (
          <div key={product._id} style={{ marginBottom: '1rem' }}>
            <strong>{product.name}</strong> — Current: <span style={{ color: 'lime' }}>{product.discountPercentage || 0}%</span>
            <input
              type="number"
              placeholder="Discount %"
              value={discountInputs[product._id] || ''}
              onChange={e => setDiscountInputs(prev => ({ ...prev, [product._id]: e.target.value }))}
              style={{ marginLeft: '1rem', width: '80px' }}
            />
            <button
              onClick={() => handleDiscountUpdate(product._id)}
              style={{ marginLeft: '0.5rem' }}
            >
              Update
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Set Price for New Products</h3>
        {unpricedProducts.length === 0 ? (
          <p>All products are priced.</p>
        ) : (
          <ul>
            {unpricedProducts.map(product => (
              <li key={product._id}>
                {product.name} (Current: ${product.price})
                <input
                  type="number"
                  placeholder="New Price"
                  value={newPrices[product._id] || ''}
                  onChange={e => handlePriceChange(product._id, e.target.value)}
                  style={{ width: '80px', marginLeft: '1rem' }}
                />
                <button onClick={() => handleSetPrice(product._id)} style={{ marginLeft: '0.5rem' }}>
                  Set Price
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>View Invoices</h3>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <button onClick={fetchInvoices}>Load Invoices</button>
        <button onClick={exportPDF}>Save as PDF</button>
        <ul>
          {invoices.map(inv => <li key={inv.id}>Invoice #{inv.id} - ${inv.total}</li>)}
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Revenue & Profit</h3>
        <button onClick={calculateRevenue}>Calculate</button>
        <canvas id="revenueChart" width="600" height="300"></canvas>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Refund Requests</h3>
        {refunds.length === 0 ? (
          <p>No refund requests.</p>
        ) : (
          <ul>
            {refunds.map(refund => (
              <li key={refund._id} style={{ marginBottom: '1rem' }}>
                <strong>{refund.productName}</strong> requested by {refund.customerName} for ${refund.amount}<br />
                Reason: {refund.reason} <br />
                Status: {refund.status}
                {refund.status === 'pending' && (
                  <>
                    <button
                      style={{ marginLeft: '1rem' }}
                      onClick={async () => {
                        await fetch(`http://localhost:5001/api/salesmanager/refund/${refund._id}/approve`, {
                          method: 'POST',
                          headers: authHeader
                        });
                        alert('Refund approved. Customer will be notified and stock updated!');
                        setRefunds(refunds => refunds.map(r => r._id === refund._id ? { ...r, status: 'approved' } : r));
                      }}
                    >Approve</button>
                    <button
                      style={{ marginLeft: '0.5rem' }}
                      onClick={async () => {
                        await fetch(`http://localhost:5001/api/salesmanager/refund/${refund._id}/deny`, {
                          method: 'POST',
                          headers: authHeader
                        });
                        alert('Refund denied.');
                        setRefunds(refunds => refunds.map(r => r._id === refund._id ? { ...r, status: 'denied' } : r));
                      }}
                    >Deny</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SalesManager;
