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
      const res = await fetch('http://localhost:5000/register', {
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

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Username: </label>
          <input 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Email: </label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Password: </label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Confirm Password: </label>
          <input 
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: '1rem' }}>
        <Link to="/admin">Go to Admin Panel</Link>
      </p>
    </div>
  );
}

export default Register;
