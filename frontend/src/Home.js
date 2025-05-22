import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const user = JSON.parse(localStorage.getItem('user'));  // mock user, replace with real user logic

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Music Goods</h1>
      <p>Selling the best music products online.</p>

      <nav style={{ marginTop: '2rem' }}>
        <Link to="/products" style={{ marginRight: '1rem' }}>Products</Link>
        <Link to="/login">Login/Register</Link>
        {user.role === 'product-manager' && (
          <Link to="/productmanager" style={{ marginLeft: '1rem' }}>Product Manager</Link>
        )}
      </nav>
    </div>
  );
}

export default Home;
