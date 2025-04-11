import React, { useContext } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import MainPage from './MainPage';
import Login from './Login';
import Register from './Register';
import ProductDetail from './ProductDetail';
import Cart from './Cart';

function App() {
  const { auth, logout } = useContext(AuthContext);
  const isAuthenticated = auth.user !== null;

  // Provides the current URL path (e.g., "/cart", "/login")
  const location = useLocation();

  // Navigation Bar Styles
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

  // Ensures both link and button share the same styling & width
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
    width: '120px' // Fixed width for uniformity
  };

  const linkButtonHover = {
    background: 'rgba(255, 0, 0, 0.4)'
  };

  // The logout button inherits linkButtonStyle, plus a cursor property
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
        <Link to="/" style={logoStyle}>
          THOR'S MIGHTY GUITAR STORE
        </Link>

        <div>
          {isAuthenticated ? (
            <>
              <span style={{ marginRight: '1em' }}>
                Logged in as <b>{auth.user}</b>
              </span>

              {/* Conditional Link:
                  If we're on /cart, show "Go Back" (link to /).
                  Otherwise, show "Go to Cart" (link to /cart). */}
              {location.pathname === '/cart' ? (
                <Link
                  to="/"
                  style={linkButtonStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  Go Back
                </Link>
              ) : (
                <Link
                  to="/cart"
                  style={linkButtonStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  Go to Cart
                </Link>
              )}

              <button
                style={logoutButtonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={logout}
              >
                Logout
              </button>
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
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </div>
  );
}

export default App;
