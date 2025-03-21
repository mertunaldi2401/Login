// Cart.js
import React, { useState, useEffect } from 'react';

function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // On mount, load cart from localStorage
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(storedCart);
  }, []);

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    padding: '2rem'
  };

  const titleStyle = {
    fontSize: '2rem',
    marginBottom: '1rem'
  };

  const itemStyle = {
    background: 'rgba(255,255,255,0.1)',
    padding: '1rem',
    marginBottom: '1rem',
    borderRadius: '6px'
  };

  const priceStyle = {
    marginTop: '1rem',
    fontWeight: 'bold'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        cartItems.map((item, index) => (
          <div key={index} style={itemStyle}>
            <h3>{item.name}</h3>
            <p>Model: {item.model}</p>
            <p>Serial: {item.serial}</p>
            <p>Price: ${item.price?.toFixed(2)}</p>
          </div>
        ))
      )}
      {cartItems.length > 0 && (
        <div style={priceStyle}>
          Total: ${totalPrice.toFixed(2)}
        </div>
      )}
    </div>
  );
}

export default Cart;
