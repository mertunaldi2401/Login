import React from 'react';

function OrderSummary({ total }) {
  const summaryStyle = {
    borderTop: '1px solid rgba(255,255,255,0.5)',
    marginTop: '1rem',
    paddingTop: '1rem',
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  };

  return (
    <div style={summaryStyle}>
      Total: ${total.toFixed(2)}
    </div>
  );
}

export default OrderSummary;
