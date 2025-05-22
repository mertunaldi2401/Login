// src/components/SalesManager.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import jsPDF from 'jspdf';
import Chart from 'chart.js/auto';
import { AuthContext } from '../AuthContext';
import './SalesManager.css';

export default function SalesManager() {
  const { auth } = useContext(AuthContext);
  const token = auth.token;
  const API_BASE = '/salesmanager';

  // --- State’ler ---
  const [refunds, setRefunds] = useState([]);
  const [discountRate, setDiscountRate] = useState('');
  const [selectedProducts, setSelectedProducts] = useState('');
  const [invoices, setInvoices]       = useState([]);
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const chartRef = useRef(null);
  const [loadingRefunds, setLoadingRefunds] = useState(true);
  const [refundError, setRefundError] = useState('');

  // --- Hata parse yardımcı ---
  const parseError = async res => {
    const txt = await res.text();
    try {
      return JSON.parse(txt).message || txt;
    } catch {
      return txt;
    }
  };

  // --- 0) Refund Requests’i getir ---
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/orders/refundRequests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await parseError(res));
        setRefunds(await res.json());
      } catch (err) {
        alert('❌ Refund list load failed: ' + err.message);
      }
    })();
  }, [token]);

  // --- Refund karar gönder ---
  const handleRefundDecision = async (orderId, approved) => {
    try {
      const res = await fetch(`/orders/${orderId}/refund`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ approved })
      });
      if (!res.ok) throw new Error(await parseError(res));
      setRefunds(prev => prev.filter(r => r._id !== orderId));
      alert(approved ? '✅ Refund approved' : '❌ Refund denied');
    } catch (err) {
      alert('❌ Couldn’t process refund: ' + err.message);
    }
  };

  // --- 1) İndirim uygulama ---
  const applyDiscount = async () => {
    const ids = selectedProducts.split(',').map(i => i.trim()).filter(Boolean);
    try {
      await Promise.all(ids.map(id =>
        fetch(`${API_BASE}/set-discount/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ discountPercentage: Number(discountRate) })
        }).then(res => {
          if (!res.ok) throw new Error(res.statusText);
        })
      ));
      alert('✅ Discount applied');
    } catch (err) {
      alert('❌ Discount error: ' + err.message);
    }
  };

  // --- 2) Fatura yükleme ---
  const fetchInvoices = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/invoices?startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(await parseError(res));
      setInvoices(await res.json());
    } catch (err) {
      alert('❌ Invoice load error: ' + err.message);
    }
  };

  // --- 3) PDF export ---
  const exportPDF = () => {
    const doc = new jsPDF();
    invoices.forEach((inv, i) =>
      doc.text(`${i + 1}. Order #${inv._id} – $${inv.totalPrice.toFixed(2)}`, 10, 10 + i * 10)
    );
    doc.save('invoices.pdf');
  };

  // --- 4) Gelir / Kar hesapla ve chart çiz ---
  const calculateRevenue = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/revenue?startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(await parseError(res));
      const { totalRevenue, totalCost, profit } = await res.json();
      const ctx = chartRef.current.getContext('2d');
      if (chartRef.current._chart) chartRef.current._chart.destroy();
      chartRef.current._chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Revenue', 'Cost', 'Profit'],
          datasets: [{ label: '$', data: [totalRevenue, totalCost, profit] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    } catch (err) {
      alert('❌ Calculation error: ' + err.message);
    }
  };

  return (
    <div className="sales-manager-container">
      {/* ===== Refund Requests ===== */}
      <section>
        <h3>Refund Requests</h3>
        {refunds.length === 0 ? (
          <p>No pending refund requests.</p>
        ) : refunds.map(r => (
          <div key={r._id} className="refund-card">
            <p>
              <strong>Order #{r._id}</strong><br/>
              Customer: {r.user.username} ({r.user.email})<br/>
              Total: ${r.totalPrice.toFixed(2)}<br/>
              Items: {r.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}
            </p>
            <button
              className="btn approve"
              onClick={() => handleRefundDecision(r._id, true)}
            >Approve</button>
            <button
              className="btn deny"
              onClick={() => handleRefundDecision(r._id, false)}
            >Deny</button>
          </div>
        ))}
      </section>

      {/* ===== Discount Section ===== */}
      <section>
        <h3>Apply Discount</h3>
        <div className="field">
          <label>Discount %:</label>
          <input
            type="number"
            min="0" max="100"
            value={discountRate}
            onChange={e => setDiscountRate(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Product IDs (csv):</label>
          <input
            type="text"
            value={selectedProducts}
            onChange={e => setSelectedProducts(e.target.value)}
          />
        </div>
        <button className="btn" onClick={applyDiscount}>Apply Discount</button>
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
        <button className="btn" onClick={fetchInvoices}>Load Invoices</button>
        <button className="btn secondary" onClick={exportPDF}>Save as PDF</button>
        <ul className="invoice-list">
          {invoices.map(inv => (
            <li key={inv._id}>
              Order #{inv._id} — ${inv.totalPrice.toFixed(2)}
            </li>
          ))}
        </ul>
      </section>

      {/* ===== Revenue & Profit ===== */}
      <section>
        <h3>Revenue & Profit</h3>
        <button className="btn" onClick={calculateRevenue}>Calculate</button>
        <div className="chart-wrapper">
          <canvas ref={chartRef} />
        </div>
      </section>
    </div>
  );
}
