import React, { useContext } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import MainPage from './MainPage';
import Login from './Login';
import Register from './Register';
import ProductDetail from './ProductDetail';
import Cart from './Cart'; // <-- New import

function App() {
  const { auth, logout } = useContext(AuthContext);
  const isAuthenticated = auth.user !== null;

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
    transition: 'background 0.3s ease'
  };

  const linkButtonHover = {
    background: 'rgba(255, 0, 0, 0.4)'
  };

  const logoutButtonStyle = {
    ...linkButtonStyle,
    cursor: 'pointer',
    border: '1px solid #d50000'
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
        {/* Product Detail route */}
        <Route path="/product/:id" element={<ProductDetail />} />
        {/* Cart route */}
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </div>
  );
}

export default App;
