// src/components/SalesManager.js

import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import Chart from 'chart.js/auto';
import './SalesManager.css';

export default function SalesManager() {
  const [discountRate, setDiscountRate] = useState('');
  const [selectedProducts, setSelectedProducts] = useState(''); // comma-separated IDs
  const [invoices, setInvoices] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const chartRef = useRef(null);

  // proxy ayarlı: React dev server bunu http://localhost:5001/salesmanager olarak yönlendirir
  const API_BASE = '/salesmanager'; 

  // --- helper: response body'i bir kere oku, önce JSON.message dener, değilse raw text döner ---
  const parseError = async (res) => {
    const text = await res.text();
    try {
      const { message } = JSON.parse(text);
      return message || text;
    } catch {
      return text;
    }
  };

  // 1) Ürün indirimlerini uygula
  const applyDiscount = async () => {
    const ids = selectedProducts
      .split(',')
      .map(i => i.trim())
      .filter(i => i);

    try {
      await Promise.all(
        ids.map(async productId => {
          const res = await fetch(`${API_BASE}/set-discount/${productId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ discountPercentage: Number(discountRate) }),
          });
          if (!res.ok) {
            const errText = await parseError(res);
            throw new Error(errText);
          }
        })
      );
      alert('✅ Discount applied and notifications sent!');
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  // 2) Faturaları getir
  const fetchInvoices = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/invoices?startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) {
        const errText = await parseError(res);
        throw new Error(errText);
      }
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  // 3) PDF export
  const exportPDF = () => {
    const doc = new jsPDF();
    invoices.forEach((inv, i) => {
      doc.text(
        `${i + 1}. Order #${inv._id} — $${inv.totalPrice.toFixed(2)}`,
        10,
        10 + i * 10
      );
    });
    doc.save('invoices.pdf');
  };

  // 4) Gelir/Maliyet/Kâr hesapla ve chart çiz
  const calculateRevenue = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/revenue?startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) {
        const errText = await parseError(res);
        throw new Error(errText);
      }
      const { totalRevenue, totalCost, profit } = await res.json();
      const ctx = chartRef.current.getContext('2d');
      if (chartRef.current._chart) chartRef.current._chart.destroy();
      chartRef.current._chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Revenue', 'Cost', 'Profit'],
          datasets: [{ label: '₺', data: [totalRevenue, totalCost, profit] }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="sales-manager-container">
      {/* ===== Discount Section ===== */}
      <section>
        <h3>Sales Manager Dashboard</h3>
        <div className="field">
          <label>Discount %:</label>
          <input
            type="number"
            min="0"
            max="100"
            value={discountRate}
            onChange={e => setDiscountRate(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Product IDs (comma separated):</label>
          <input
            type="text"
            value={selectedProducts}
            onChange={e => setSelectedProducts(e.target.value)}
          />
        </div>
        <button className="btn" onClick={applyDiscount}>
          Apply Discount
        </button>
      </section>

      {/* ===== Invoices Section ===== */}
      <section>
        <h3>View Invoices</h3>
        <div className="field">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        <button className="btn" onClick={fetchInvoices}>
          Load Invoices
        </button>
        <button className="btn secondary" onClick={exportPDF}>
          Save as PDF
        </button>
        <ul className="invoice-list">
          {invoices.map(inv => (
            <li key={inv._id}>
              Order #{inv._id} — ${inv.totalPrice.toFixed(2)}
            </li>
          ))}
        </ul>
      </section>

      {/* ===== Revenue & Profit Section ===== */}
      <section>
        <h3>Revenue & Profit</h3>
        <button className="btn" onClick={calculateRevenue}>
          Calculate
        </button>
        <div className="chart-wrapper">
          <canvas ref={chartRef} />
        </div>
      </section>
    </div>
  );
}