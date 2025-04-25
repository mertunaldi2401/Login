import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isValidPassword = (pw) => {
    const lengthCheck = pw.length >= 8;
    const digitCheck = /\d/.test(pw);
    const specialCharCheck = /[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|-]/.test(pw);
    return lengthCheck && digitCheck && specialCharCheck;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidPassword(password)) {
      setError('Password must be >= 8 chars, include a digit, and a special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword })
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/login');
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
        <h2 style={titleStyle}>Register</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username: </label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              style={inputStyle}
            />
          </div>
          <div>
            <label>Email: </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div>
            <label>Confirm Password: </label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;