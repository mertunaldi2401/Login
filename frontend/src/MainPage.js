// ✅ MainPage.js
import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import Products from './Products';
import { Link, useLocation } from 'react-router-dom';

function MainPage({ searchQuery }) {
  const { auth } = useContext(AuthContext);
  const username = auth.user ? auth.user : 'Guest';

  // ✅ Extract category filter from the URL
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryQuery = params.get('category') || '';

  const pageStyle = {
    background: 'linear-gradient(135deg, #2a2a2a, #111)',
    minHeight: '100vh',
    padding: '3rem 2rem',
    color: '#fff',
    fontFamily: '"Metal Mania", cursive',
    position: 'relative'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '2rem',
    textShadow: '2px 2px 5px rgba(0,0,0,0.7)'
  };

  const titleStyle = {
    fontSize: '4rem',
    margin: 0,
    color: '#d50000'
  };

  const subtitleStyle = {
    fontSize: '1.5rem',
    marginTop: '1rem'
  };

  const productsContainerStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 0 15px rgba(0,0,0,0.5)'
  };

  const cartButtonStyle = {
    marginTop: '2rem',
    background: 'rgba(255, 0, 0, 0.3)',
    padding: '0.8rem 1.2rem',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold'
  };

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Rock Your World!</h1>
        <p style={subtitleStyle}>
          Welcome, {username}! Unleash the riffs with our epic collection of guitars and effects.
        </p>
      </header>

      <section style={productsContainerStyle}>
        {/* ✅ Pass category and search to Products */}
        <Products searchQuery={searchQuery} categoryFilter={categoryQuery} />
        <div style={{ textAlign: 'center' }}>
          <Link to="/cart">
            <button style={cartButtonStyle}>Go to Cart</button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default MainPage;
