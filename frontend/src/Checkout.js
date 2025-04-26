import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(storedCart);
  }, []);

  const totalQuantity = cartItems.length;
  const subtotalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2);

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    backgroundColor: '#1e1e1e',
    color: 'white'
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginTop: '10px',
    display: 'block',
    fontFamily: 'Metal Mania'
  };

  const sectionStyle = {
    marginBottom: '20px'
  };

  const handleMakePayment = () => {
    navigate('/receipt'); // ✅ Navigate to receipt page
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', color: 'white', backgroundColor: 'black', padding: '2rem' }}>
      <div style={{ flex: 1, paddingRight: '2rem', maxWidth: '700px' }}>
        <h2 style={{ fontFamily: 'Metal Mania', marginBottom: '1.5rem' }}>Checkout</h2>

        <form>
          <div style={sectionStyle}>
            <label style={labelStyle}>Street Address</label>
            <input type="text" placeholder="123 Main St" style={inputStyle} required />
          </div>

          <div style={{ display: 'flex', gap: '1rem', ...sectionStyle }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Town/City</label>
              <input type="text" placeholder="Your city" style={inputStyle} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Postal Code</label>
              <input type="text" placeholder="ZIP / Postal" style={inputStyle} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', ...sectionStyle }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Province/Region</label>
              <input type="text" placeholder="Region" style={inputStyle} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Country</label>
              <select style={inputStyle} required>
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="TR">Turkey</option>
                <option value="DE">Germany</option>
              </select>
            </div>
          </div>

          <hr style={{ margin: '2rem 0', borderColor: '#333' }} />

          <div style={sectionStyle}>
            <label style={labelStyle}>Cardholder Name</label>
            <input type="text" placeholder="Full name on card" style={inputStyle} required />
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>Card Number</label>
            <input type="text" placeholder="1234 5678 9012 3456" style={inputStyle} required />
          </div>

          <div style={{ display: 'flex', gap: '1rem', ...sectionStyle }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Expiration Date</label>
              <input type="text" placeholder="MM/YY" style={inputStyle} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>CVV</label>
              <input type="password" placeholder="123" style={inputStyle} required />
            </div>
          </div>
        </form>
      </div>

      <div style={{ backgroundColor: '#1e1e1e', padding: '1.5rem', borderRadius: '10px', width: '300px', height: 'fit-content' }}>
        <h3 style={{ fontFamily: 'Metal Mania', marginBottom: '1rem' }}>Order Summary</h3>
        {cartItems.map((item, index) => (
          <div key={index}>{item.name} - ${item.price}</div>
        ))}
        <p style={{ marginTop: '1rem' }}>Total items: {totalQuantity}</p>
        <p>Subtotal: ${subtotalPrice}</p>

        <button
          style={{ backgroundColor: 'red', color: 'white', padding: '0.75rem', borderRadius: '5px', fontWeight: 'bold', width: '100%', marginTop: '1rem', border: 'none' }}
          onClick={handleMakePayment}
        >
          Make Payment
        </button>
      </div>
    </div>
  );
}

export default Checkout;
