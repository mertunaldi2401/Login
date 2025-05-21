import React, { useState } from 'react';
import jsPDF from 'jspdf';
import Chart from 'chart.js/auto';
import './SalesManager.css'; // ✅ Import CSS

function SalesManager() {
  const [discountRate, setDiscountRate] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [revenueData, setRevenueData] = useState([]);

  const applyDiscount = async () => {
    await fetch('/api/salesmanager/apply-discount', {
      method: 'POST',
      body: JSON.stringify({ discountRate, productIds: selectedProducts }),
      headers: { 'Content-Type': 'application/json' }
    });
    alert('Discount applied and users notified!');
  };

  const fetchInvoices = async () => {
    const res = await fetch(`/api/salesmanager/invoices?start=${startDate}&end=${endDate}`);
    const data = await res.json();
    setInvoices(data);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    invoices.forEach((inv, i) => doc.text(`${i + 1}. ${inv.id} - $${inv.total}`, 10, 10 + i * 10));
    doc.save('invoices.pdf');
  };

  const calculateRevenue = async () => {
    const res = await fetch(`/api/salesmanager/revenue?start=${startDate}&end=${endDate}`);
    const data = await res.json();
    setRevenueData(data);

    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [
          {
            label: 'Revenue',
            data: data.map(d => d.revenue),
            borderColor: 'green'
          },
          {
            label: 'Profit',
            data: data.map(d => d.profit),
            borderColor: 'blue'
          }
        ]
      }
    });
  };

  return (
    <div className="sales-manager-container">
      <h2>Sales Manager Dashboard</h2>

      <div>
        <h3>Set Discount</h3>
        <input placeholder="Discount %" value={discountRate} onChange={e => setDiscountRate(e.target.value)} />
        <input placeholder="Product IDs (comma-separated)" onChange={e => setSelectedProducts(e.target.value.split(','))} />
        <button onClick={applyDiscount}>Apply Discount</button>
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
    </div>
  );
}

export default SalesManager;
