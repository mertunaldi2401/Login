import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Build headers – attach guest session if it exists
      const headers = { 'Content-Type': 'application/json' };
      const guestId = localStorage.getItem('guestId');
      if (guestId) {
        headers['x-guest-session'] = guestId;
      }

      const res = await fetch('http://localhost:5001/auth/login', {
        method: 'POST',
        headers,
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token);
        localStorage.removeItem('guestId');
        navigate('/');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const pageStyle = {
    background: 'linear-gradient(135deg, #2a2a2a, #111)',
    minHeight: '100vh',
    padding: '3rem 2rem',
    color: '#fff',
    fontFamily: '"Metal Mania", cursive',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const formContainerStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
    width: '100%',
    maxWidth: '400px'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    marginTop: '1rem',
    background: 'linear-gradient(45deg, #ff0000, #990000)',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s ease'
  };

  const titleStyle = {
    textAlign: 'center',
    fontSize: '3rem',
    marginBottom: '1rem',
    color: '#d50000',
    textShadow: '2px 2px 5px rgba(0,0,0,0.7)'
  };

  return (
    <div style={pageStyle}>
      <div style={formContainerStyle}>
        <h2 style={titleStyle}>Login</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username/Email: </label>
            <input 
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required 
              style={inputStyle}
            />
          </div>
          <div>
            <label>Password: </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={inputStyle}
            />
          </div>
          <button 
            type="submit" 
            style={buttonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(45deg, #ff3333, #cc0000)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(45deg, #ff0000, #990000)')}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;