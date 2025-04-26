// Cart.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(res.data.items || []);
      } catch (err) {
        console.error('Failed to fetch cart:', err.response?.data || err.message);
      }
    };

    fetchCart();
  }, []);

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.product?.price || 0), 0);

  const handleRemoveItem = (indexToRemove) => {
    const updatedCart = cartItems.filter((_, index) => index !== indexToRemove);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

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

  const removeButtonStyle = {
    background: 'red',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '0.5rem'
  };

  const checkoutButtonStyle = {
    marginTop: '2rem',
    background: 'linear-gradient(45deg, #ff0000, #990000)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.75rem 2rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        cartItems.map((item, index) => (
          <div key={index} style={itemStyle}>
            <h3>{item.product?.name}</h3>
            <p>Model: {item.product?.model}</p>
            <p>Serial: {item.product?.serialNumber}</p>
            <p>Price: ${item.product?.price?.toFixed(2)}</p>
            <button
              style={removeButtonStyle}
              onClick={() => handleRemoveItem(index)}
            >
              Remove From Cart
            </button>
          </div>
        ))
      )}
      {cartItems.length > 0 && (
        <>
          <div style={priceStyle}>
            Total: ${totalPrice.toFixed(2)}
          </div>
          <button
            style={checkoutButtonStyle}
            onClick={() => navigate('/checkout')}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(45deg, #ff3333, #cc0000)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(45deg, #ff0000, #990000)'}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;
