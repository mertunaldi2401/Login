import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import Chart from 'chart.js/auto';
import './SalesManager.css';

export default function SalesManager() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [revenueData, setRevenueData] = useState([]);

  // Fetch products once on mount
  useEffect(() => {
    fetch('http://localhost:5001/products')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch products:', err));
  }, []);

  const handleSetPrice = async () => {
    if (!selectedId) {
      alert('Please select a product first.');
      return;
    }
    await fetch(`http://localhost:5001/api/salesmanager/set-price/${selectedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: Number(price) })
    });
    alert('Price updated');
  };

  const handleSetDiscount = async () => {
    if (!selectedId) {
      alert('Please select a product first.');
      return;
    }
    await fetch(`http://localhost:5001/api/salesmanager/set-discount/${selectedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discountPercentage: Number(discount) })
    });
    alert('Discount applied');
  };

  const fetchInvoices = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }
    const q = new URLSearchParams({ startDate, endDate });
    const data = await fetch(`http://localhost:5001/api/salesmanager/invoices?${q}`)
      .then(res => res.json());
    setInvoices(data);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    invoices.forEach((inv, i) =>
      doc.text(`${i + 1}. Invoice #${inv._id} - $${inv.totalPrice}`, 10, 10 + i * 10)
    );
    doc.save('invoices.pdf');
  };

  const calculateRevenue = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }
    const q = new URLSearchParams({ startDate, endDate });
    const data = await fetch(`http://localhost:5001/api/salesmanager/revenue?${q}`)
      .then(res => res.json());
    setRevenueData(data);

    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [
          { label: 'Revenue', data: data.map(d => d.revenue), borderColor: 'green' },
          { label: 'Profit',  data: data.map(d => d.profit),  borderColor: 'blue' }
        ]
      }
    });
  };

  return (
    <div className="sales-manager-container">
      <h2>Sales Manager Panel</h2>

      <section>
        <h3>Products</h3>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">— Select Product —</option>
          {products.map(p => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.category})
            </option>
          ))}
        </select>

        <div>
          <input
            type="number"
            placeholder="New Price"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
          <button onClick={handleSetPrice}>Set Price</button>
        </div>

        <div>
          <input
            type="number"
            placeholder="Discount %"
            value={discount}
            onChange={e => setDiscount(e.target.value)}
          />
          <button onClick={handleSetDiscount}>Apply Discount</button>
        </div>
      </section>

      <section>
        <h3>Invoices</h3>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
        <button onClick={fetchInvoices}>Load Invoices</button>
        <button onClick={exportPDF}>Save as PDF</button>

        <ul>
          {invoices.map(inv => (
            <li key={inv._id}>
              Invoice #{inv._id} — ${inv.totalPrice}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Revenue & Profit</h3>
        <button onClick={calculateRevenue}>Calculate</button>
        <canvas id="revenueChart" width="600" height="300"></canvas>
      </section>
    </div>
  );
}
