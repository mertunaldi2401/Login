// ✅ MainPage.js
import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import Products, { products } from './Products';
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

  // List of top-selling products (first 3 for demo)
  // Top Sellers: seçili kategoriye göre filtrele, sonra ilk 3’ü al
  const topSellers = products
    .filter(p => {
      // Eğer kategori seçilmemiş ya da 'All' ise tüm ürünleri al, değilse eşleşeni
      return !categoryQuery || categoryQuery === 'All'
        ? true
        : p.category.toLowerCase() === categoryQuery.toLowerCase();
    })
    .slice(0, 3);
  // Styles for best sellers section
  const bestSectionStyle = { textAlign: 'center', margin: '2rem 0' };
  const bestTitleStyle = {
    fontSize: '2.5rem',
    color: '#d50000',
    marginBottom: '1rem',
    fontFamily: '"Metal Mania", cursive'
  };
  const bestWrapperStyle = { display: 'flex', justifyContent: 'center', gap: '2rem' };
  const bestCardStyle = {
    width: '200px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center'
  };

  // Category button labels
  const categoryButtons = ['All', 'Guitars', 'Effects', 'Strings'];
  // Styles for category buttons
  const categoryButtonsContainer = {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem'
  };
  const categoryButtonStyle = {
    padding: '0.5rem 1rem',
    background: '#d50000',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    textDecoration: 'none',
    fontFamily: '"Metal Mania", cursive',
    cursor: 'pointer'
  };

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Rock Your World!</h1>
        <p style={subtitleStyle}>
          Welcome, {username}! Unleash the riffs with our epic collection of guitars and effects.
        </p>
      </header>

      <div style={categoryButtonsContainer}>
        {categoryButtons.map(cat => (
          <Link
            key={cat}
            to={cat === 'All' ? '/' : `/?category=${encodeURIComponent(cat)}`}
            style={categoryButtonStyle}
          >
            {cat}
          </Link>
        ))}
      </div>

      {(!categoryQuery || categoryQuery === 'All') && (
      <section style={bestSectionStyle}>
        <h2 style={bestTitleStyle}>Top Sellers</h2>
        <div style={bestWrapperStyle}>
          {topSellers.map(p => (
            <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={bestCardStyle}>
                <img src={p.image} alt={p.name} style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
                <h3 style={{ fontSize: '1rem', color: '#fff', margin: '0.5rem 0', fontFamily: '"Metal Mania", cursive' }}>
                  {p.name}
                </h3>
                <p style={{ color: '#ff0', margin: '0.25rem 0' }}>${p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}

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
