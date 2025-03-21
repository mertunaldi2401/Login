import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import Products from './Products';

function MainPage() {
  const { auth } = useContext(AuthContext);

  return (
    <div style={{ padding: '20px' }}>
      {/* Welcome Section */}
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1>Welcome, {auth.user}!</h1>
        <p>Check out our latest guitar collection.</p>
      </header>

      {/* Products List */}
      <Products />
    </div>
  );
}

export default MainPage;