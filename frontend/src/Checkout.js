import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Checkout() {
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

  const [cartItems, setCartItems] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    province: '',
    country: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
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

  const totalQuantity = cartItems.length;
  const subtotalPrice = cartItems.reduce((sum, item) => sum + (item.product?.price || 0), 0).toFixed(2);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Card number formatting
    if (name === "cardNumber") {
      formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    }

    // Expiry date formatting (MM/YY)
    else if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    }

    // CVV formatting (3-4 digits only)
    else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    const updatedFormData = {
      ...formData,
      [name]: formattedValue
    };
    setFormData(updatedFormData);

    // Clear the error if the form is now valid
    if (isFormValid(updatedFormData)) {
      setErrorMessage('');
    }
  };

  const isFormValid = (data) => {
    return Object.values(data).every((field) => field.trim() !== '');
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid(formData)) {
      setErrorMessage("⚠️ Please fill in all the required fields.");
      toast.error("⚠️ Please fill in all the required fields.");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const res = await axios.post(
        'http://localhost:5001/orders',
        { deliveryAddress: formData },
        { headers: getHeaders() }
      );

      const order = res.data.order;
      console.log('Order created:', order);

      localStorage.removeItem('cart');
      toast.success("✅ Invoice has been sent to your email!");
      navigate(`/invoice/${order._id}`);
    } catch (err) {
      console.error('❌ Frontend order error:', err.response?.data || err.message);
      toast.error('❌ Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

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

  const errorStyle = {
    color: '#ff3333',
    fontWeight: 'bold',
    marginTop: '0.5rem',
    marginBottom: '0.5rem'
  };

  return (
    <div style={containerStyle}>
      <div style={formSectionStyle}>
        <h2>Checkout</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label style={labelStyle}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</label>
              <input 
                type="text" 
                name={key} 
                value={formData[key]} 
                onChange={handleInputChange} 
                style={inputStyle} 
              />
            </div>
          ))}

          {errorMessage && <div style={errorStyle}>{errorMessage}</div>}

          <button 
            type="button" 
            onClick={handlePlaceOrder} 
            style={buttonStyle}
          >
            Make Payment
          </button>
        </form>
      </div>

      <div style={summarySectionStyle}>
        <h3>Order Summary</h3>
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {cartItems.map((item, index) => (
            <li key={index} style={{ marginBottom: '0.5rem' }}>
              {item.product?.name} - ${item.product?.price?.toFixed(2)}
            </li>
          ))}
        </ul>
        <p><strong>Total items:</strong> {totalQuantity}</p>
        <p><strong>Subtotal:</strong> ${subtotalPrice}</p>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}

export default Checkout;
