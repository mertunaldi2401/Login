import React, { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';
import Products from './Products';
import { Link, useLocation } from 'react-router-dom';

export default function MainPage({ searchQuery }) {
  const { auth } = useContext(AuthContext);
  const user = auth.user || {};
  const location = useLocation();
  const category = new URLSearchParams(location.search).get('category') || '';
  const [sortOrder, setSortOrder] = useState('');

  const pageStyle = {
    background: 'linear-gradient(135deg, #2a2a2a, #111)',
    minHeight: '100vh',
    padding: '3rem 2rem',
    color: '#fff',
    fontFamily: '"Metal Mania", cursive'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '2rem',
    textShadow: '2px 2px 5px rgba(0,0,0,0.7)'
  };

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h1 style={{ fontSize:'4rem', color:'#d50000', margin:0 }}>Rock Your World!</h1>
        <p style={{ fontSize:'1.5rem', marginTop:'1rem' }}>
          Welcome, {user.username || 'Guest'}! Unleash the riffs with our epic collection.
        </p>
      </header>

      <section>
        <Products
          searchQuery={searchQuery}
          categoryFilter={category}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </section>

      <div style={{ textAlign:'center', marginTop:'2rem' }}>
        <Link to="/cart"><button style={{ padding:'0.8rem 1.2rem' }}>Go to Cart</button></Link>
        {user.role === 'product-manager' && (
          <Link to="/productmanager"><button style={{ marginLeft:'1rem', padding:'0.8rem 1.2rem' }}>Product Manager</button></Link>
        )}
        {user.role === 'sales-manager' && (
          <Link to="/salesmanager"><button style={{ marginLeft:'1rem', padding:'0.8rem 1.2rem' }}>Sales Manager</button></Link>
        )}
      </div>
    </div>
  );
}
