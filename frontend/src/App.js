import React, { useContext } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Login from './Login';
import Register from './Register';
import Welcome from './Welcome';

function App() {
  const { auth, logout } = useContext(AuthContext);
  const isAuthenticated = auth.user != null;

  return (
    <div>
      <nav style={{ padding: '1em' }}>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: '1em' }}>Logged in as <b>{auth.user}</b></span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '1em' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={isAuthenticated ? <Welcome /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
