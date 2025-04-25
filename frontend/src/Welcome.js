import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';

function Welcome() {
  const { auth } = useContext(AuthContext);
  return (
    <div>
      <h2>Welcome, {auth.user}!</h2>
      <p>You are now logged in.</p>
    </div>
  );
}

export default Welcome;
