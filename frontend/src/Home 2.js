import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Music Goods</h1>
      <p>Selling the best music products online.</p>

      <nav style={{ marginTop: '2rem' }}>
        <Link to="/products" style={{ marginRight: '1rem' }}>Products</Link>
        <Link to="/login">Login/Register</Link>
      </nav>
    </div>
  );
}

export default Home;
