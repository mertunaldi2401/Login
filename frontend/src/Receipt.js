import React from 'react';

function Receipt() {
  const pageStyle = {
    backgroundColor: 'black',
    color: 'white',
    minHeight: '100vh',
    padding: '3rem',
    textAlign: 'center',
    fontFamily: 'Metal Mania'
  };

  const buttonStyle = {
    marginTop: '2rem',
    backgroundColor: 'red',
    color: 'white',
    padding: '0.75rem 1.5rem',
    fontSize: '1.2rem',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'not-allowed'
  };

  return (
    <div style={pageStyle}>
      <h1>✅ Your order has been created!</h1>
      <p>The invoice has been sent to your email automatically.</p>
      <button style={buttonStyle} disabled>
        Download Invoice (Coming Soon)
      </button>
    </div>
  );
}

export default Receipt;
