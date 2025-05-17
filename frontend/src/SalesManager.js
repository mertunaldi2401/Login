import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SalesManagerDashboard = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [unpricedProducts, setUnpricedProducts] = useState([]);
  const [newPrices, setNewPrices] = useState({});
  const token = localStorage.getItem('token');

  const fetchReport = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/sales/report?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setReportData(data.report);
      setInvoices(data.invoices);
    } catch (err) {
      alert('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpricedProducts = async () => {
    try {
      const res = await fetch('http://localhost:5001/products/unpriced', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUnpricedProducts(data);
    } catch (err) {
      console.error('Failed to load unpriced products');
    }
  };

  const handleSetPrice = async (productId) => {
    const price = newPrices[productId];
    if (!price || isNaN(price)) return alert('Please enter a valid price');
    try {
      const res = await fetch(`http://localhost:5001/products/${productId}/set-price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ price: parseFloat(price) })
      });
      if (!res.ok) throw new Error('Failed to set price');
      alert('Price set successfully');
      fetchUnpricedProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchUnpricedProducts();
  }, []);

  const chartData = {
    labels: reportData.map(r => new Date(r.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Profit',
        data: reportData.map(r => r.profit),
        borderColor: 'green',
        fill: false
      },
      {
        label: 'Revenue',
        data: reportData.map(r => r.revenue),
        borderColor: 'blue',
        fill: false
      }
    ]
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Sales Manager Dashboard</h2>

      {/* Revenue & Profit Report */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>📊 Revenue & Profit Report</h3>
        <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start Date" />
        <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End Date" />
        <button onClick={fetchReport} disabled={loading} style={{ marginLeft: '1rem' }}>
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
        {reportData.length > 0 && (
          <>
            <Line data={chartData} />
            <h4>Invoices</h4>
            <ul>
              {invoices.map(inv => (
                <li key={inv._id}>
                  Invoice #{inv._id} - {new Date(inv.date).toLocaleDateString()} - ${inv.total}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Price Setting Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>💵 Set Prices for New Products</h3>
        {unpricedProducts.length === 0 ? (
          <p>No unpriced products found.</p>
        ) : (
          <ul>
            {unpricedProducts.map(p => (
              <li key={p._id} style={{ marginBottom: '1rem' }}>
                <strong>{p.name}</strong>
                <input
                  type="number"
                  placeholder="Enter price"
                  value={newPrices[p._id] || ''}
                  onChange={e => setNewPrices(prev => ({ ...prev, [p._id]: e.target.value }))}
                  style={{ marginLeft: '1rem' }}
                />
                <button onClick={() => handleSetPrice(p._id)} style={{ marginLeft: '0.5rem' }}>Set Price</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SalesManagerDashboard;
