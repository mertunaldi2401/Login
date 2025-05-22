import React, { useContext, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import MainPage from './MainPage';
import Login from './Login';
import Register from './Register';
import Products from './Products';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Checkout from './Checkout';
import Admin from './Admin';
import Profile from './Profile';
import InvoicePage from './InvoicePage';
import ProductManager from './ProductManager';
import SalesManager from './SalesManager'; // ✅ Updated to import the correct component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons';
import OrderHistory from './OrderHistory';

function App() {
  const { auth, logout } = useContext(AuthContext);
  const displayName = React.useMemo(() => {
    if (!auth.user) return '';
    if (typeof auth.user === 'string') {
      return auth.user.split('@')[0];
    }
    if (auth.user.username) return auth.user.username;
    if (auth.user.email) return auth.user.email.split('@')[0];
    return '';
  }, [auth.user]);

  const isAuthenticated = auth.user !== null;
  const location = useLocation();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
    }
  };

  const handleIconClick = () => {
    setSearchQuery(searchInput);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    if (category) {
      navigate(`/?category=${encodeURIComponent(category)}`);
    } else {
      navigate('/');
    }
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'linear-gradient(90deg, #1f1f1f, #2e2e2e)',
    color: '#fff',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    borderBottom: '3px solid #d50000'
  };

  const logoStyle = {
    fontFamily: '"Metal Mania", cursive',
    fontSize: '1.8rem',
    textDecoration: 'none',
    color: '#fff',
    textShadow: '2px 2px 5px rgba(0,0,0,0.5)'
  };

  const linkButtonStyle = {
    textDecoration: 'none',
    color: '#fff',
    background: 'rgba(255, 0, 0, 0.2)',
    padding: '0.5em 1em',
    borderRadius: '4px',
    marginRight: '1rem',
    fontWeight: 'bold',
    border: '1px solid #d50000',
    transition: 'background 0.3s ease',
    display: 'inline-block',
    textAlign: 'center',
    width: '120px'
  };

  const linkButtonHover = {
    background: 'rgba(255, 0, 0, 0.4)'
  };

  const logoutButtonStyle = {
    ...linkButtonStyle,
    cursor: 'pointer'
  };

  const handleMouseEnter = (e) => {
    Object.assign(e.target.style, linkButtonHover);
  };

  const handleMouseLeave = (e) => {
    Object.assign(e.target.style, { background: 'rgba(255, 0, 0, 0.2)' });
  };

  return (
    <div>
      <nav style={navStyle}>
        <Link to="/" style={logoStyle}>THOR'S MIGHTY GUITAR STORE</Link>

        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleEnter}
            style={{ width: '100%', padding: '0.5rem 0.2rem 0.5rem 0.75rem', fontSize: '1rem', borderRadius: '4px', border: 'none', backgroundColor: '#fff', color: '#333' }}
          />
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: '#cf0808', fontSize: '1.4rem', cursor: 'pointer', marginLeft: '0.5rem' }} onClick={handleIconClick} />
        </div>

        <div>
          {isAuthenticated ? (
            <>
              <span style={{ marginRight: '1em' }}>
                Logged in as <b>{displayName}</b>
              </span>

              <Link to="/profile" style={{ marginRight: '1rem', fontSize: '1.5rem', color: '#fff' }}>
                <FontAwesomeIcon icon={faUser} title="Profile" />
              </Link>

              <Link
                to="/cart"
                style={linkButtonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Go to Cart
              </Link>

              <span
                onClick={logout}
                style={logoutButtonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Logout
              </span>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={linkButtonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Login
              </Link>

              <Link
                to="/register"
                style={linkButtonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<MainPage searchQuery={searchQuery} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/invoice/:orderId" element={<InvoicePage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/productmanager" element={<ProductManager />} />
        <Route path="/salesmanager" element={<SalesManager />} />
        <Route path="/orders/history" element={<OrderHistory />} />
      </Routes>
    </div>
  );
}

export default App;
