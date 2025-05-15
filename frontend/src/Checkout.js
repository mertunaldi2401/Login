import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Checkout() {
  // Helper to get headers for API calls
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    const guestId = localStorage.getItem('guestId');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    } else if (guestId) {
      return { 'x-guest-session': guestId };
    }
    return {};
  };

  // State for cart items and form inputs
  const [cartItems, setCartItems] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get('http://localhost:5001/cart', {
          headers: getHeaders(),
        });
        setCartItems(res.data.items || []);
      } catch (err) {
        console.error('❌ Failed to load cart from backend:', err.response?.data || err.message);
      }
    };

    fetchCart();
  }, []);

  // Calculate total quantity and subtotal price
  const totalQuantity = cartItems.length;
  const subtotalPrice = cartItems.reduce((sum, item) => sum + (item.product?.price || 0), 0).toFixed(2);

  // Form Validation
  const isFormValid = () => {
    return firstName && lastName && address && city && postalCode && province && country && phone && cardNumber && expiryDate && cvv;
  };

  // Handle Place Order
  const handlePlaceOrder = async () => {
    if (!isFormValid()) {
      toast.error("⚠️ Please fill in all the required fields.");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const res = await axios.post('http://localhost:5001/orders', {}, {
        headers: getHeaders(),
      });

      const order = res.data.order;
      console.log('Order created:', order);

      localStorage.removeItem('cart');
      toast.success('✅ Invoice has been sent to your email!');
      navigate(`/invoice/${order._id}`);
    } catch (err) {
      console.error('❌ Frontend order error:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Styles (Preserved from Original Version)
  const containerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    color: '#fff',
    fontFamily: '"Metal Mania", cursive',
    minHeight: '100vh',
    padding: '2rem'
  };

  const formSectionStyle = {
    flex: '1 1 400px',
    marginRight: '2rem'
  };

  const summarySectionStyle = {
    flex: '0 0 300px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '1.5rem',
    marginTop: '1.5rem',
    height: 'fit-content'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.25rem',
    fontWeight: '500'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    marginTop: '1rem',
    background: 'linear-gradient(45deg, #ff0000, #990000)',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      {/* Left Section: Checkout Form */}
      <div style={formSectionStyle}>
        <h2>Checkout</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <label style={labelStyle}>First Name</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />

          <label style={labelStyle}>Last Name</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} />

          <label style={labelStyle}>Street Address</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />

          <label style={labelStyle}>Apartment/Suite (Optional)</label>
          <input type="text" value={apartment} onChange={(e) => setApartment(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Town/City</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required style={inputStyle} />

          <label style={labelStyle}>Postal Code</label>
          <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required style={inputStyle} />

          <label style={labelStyle}>Card Number</label>
          <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required style={inputStyle} />

          <label style={labelStyle}>Expiry Date (MM/YY)</label>
          <input type="text" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required style={inputStyle} />

          <label style={labelStyle}>CVV</label>
          <input type="text" value={cvv} onChange={(e) => setCvv(e.target.value)} required style={inputStyle} />

          <button type="button" onClick={handlePlaceOrder} style={buttonStyle}>Make Payment</button>
        </form>
      </div>

      {/* Right Section: Order Summary (UNCHANGED) */}
      <div style={summarySectionStyle}>
        <h3>Order Summary</h3>
        <p>Total items: {totalQuantity}</p>
        <p>Subtotal: ${subtotalPrice}</p>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}

export default Checkout;
