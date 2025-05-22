// frontend/src/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  return (
    <div style={{ textAlign:'center', padding:'2rem' }}>
      <h1>Music Goods</h1>
      <p>Best music products online.</p>

      <nav style={{ marginTop:'2rem' }}>
        <Link to="/products" style={{ marginRight:'1rem' }}>Products</Link>
        <Link to="/login">Login/Register</Link>
        {user.role === 'product-manager' && (
          <Link to="/productmanager" style={{ marginLeft:'1rem' }}>Product Manager</Link>
        )}
        {user.role === 'sales-manager' && (
          <Link to="/salesmanager" style={{ marginLeft:'1rem' }}>Sales Manager</Link>
        )}
      </nav>
    </div>
  );
}
