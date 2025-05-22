// ✅ MainPage.js
import React, { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';
import Products from './Products';
import { Link, useLocation } from 'react-router-dom';

function MainPage({ searchQuery }) {
  const { auth } = useContext(AuthContext);
  // Derive a user‑friendly display name (username) for the welcome banner
  const displayName = React.useMemo(() => {
    if (!auth.user) return 'Guest';
    // Case 1: auth.user is a plain string
    if (typeof auth.user === 'string') {
      return auth.user.split('@')[0];
    }
    // Case 2: auth.user is an object from backend
    if (auth.user.username) return auth.user.username;
    if (auth.user.email) return auth.user.email.split('@')[0];
    return 'Guest';
  }, [auth.user]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryQuery = params.get('category') || '';

  const [sortOrder, setSortOrder] = useState('');

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
    background: 'linear-gradient(135deg, #d50000, #111)', // ✅ Red background for products box
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
    position: 'relative'
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
          Welcome, {displayName}! Unleash the riffs with our epic collection of guitars and effects.
        </p>
      </header>

      <section style={productsContainerStyle}>
        {/* ✅ Pass sortOrder and setSortOrder to Products */}
        <Products
          searchQuery={searchQuery}
          categoryFilter={categoryQuery}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        <div style={{ textAlign: 'center' }}>
          {(auth.token || localStorage.getItem('guestId')) && (
            <Link to="/cart">
              <button style={cartButtonStyle}>Go to Cart</button>
            </Link> 
          )}
          {auth.token && (
            <Link to="/orders/history">
              <button style={{ ...cartButtonStyle, marginLeft: '1rem' }}>
                My Orders
              </button>
            </Link>
          )}
          {auth.user?.role === 'customer' && (
            <Link to="/orders/history">
              <button style={{ ...cartButtonStyle, marginLeft: '1rem' }}>My Orders</button>
            </Link>
          )}
          {auth.user?.role === 'product-manager' && (
            <Link to="/productmanager">
              <button style={{ ...cartButtonStyle, marginLeft: '1rem' }}>Product Manager Panel</button>
            </Link>
          )}
          {auth.user?.role === 'sales-manager' && (
            <Link to="/salesmanager">
              <button style={{ ...cartButtonStyle, marginLeft: '1rem' }}>Sales Manager Panel</button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default MainPage;
