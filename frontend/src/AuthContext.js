import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, token: null });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setAuth({ user: savedUser, token: savedToken });
    }
  }, []);

  const login = (token) => {
    const decoded = jwtDecode(token);
    localStorage.setItem('user', decoded.username); // or .email or .role if needed
    localStorage.setItem('token', token);
    setAuth({ user: decoded, token });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuth({ user: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
