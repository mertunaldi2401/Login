import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Checkout() {
  // State for cart items (retrieved from localStorage for this example)
  const [cartItems, setCartItems] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // Inline styles for the component (preserving black theme)
  const containerStyle = {
    display: 'flex',
    flexWrap: 'wrap',               // allow stacking on small screens
    justifyContent: 'space-between',
    backgroundColor: '#000',        // black background
    color: '#fff',                  // white text for contrast
    fontFamily: '"Metal Mania", cursive', // site font for consistency
    minHeight: '100vh',             // full viewport height (if needed to push footer down)
    padding: '2rem'
  };
  const formSectionStyle = {
    flex: '1 1 400px',              // grow to fill space, minimum width ~400px for form
    marginRight: '2rem'             // gap between form and summary
  };
  const summarySectionStyle = {
    flex: '0 0 300px',              // do not grow, fixed width for summary (adjust as needed)
    backgroundColor: 'rgba(255,255,255,0.1)', // translucent panel on dark background
    borderRadius: '8px',
    padding: '1.5rem',
    marginTop: '1.5rem',            // some top margin in case it wraps under form on mobile
    height: 'fit-content'           // so it wraps its content height (to not stretch full height of container)
  };
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',            // space between fields
    backgroundColor: '#333',       // dark input background to match theme
    color: '#fff',                 // light text for contrast
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem'
  };
  const labelStyle = {
    display: 'block',
    marginBottom: '0.25rem',
    fontWeight: '500'             // semi-bold labels for readability
  };
  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    marginTop: '1rem',
    background: 'linear-gradient(45deg, #ff0000, #990000)',  // red gradient
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center'
    // (Hover effect added via onMouseEnter/Leave in JSX below)
  };

  // Additional styling for responsive tweaks (optional):
  // e.g., we could adjust flexDirection for very narrow screens via JS or add media queries in a styled-jsx block.

  // Place Order Handler
  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);
      const token = localStorage.getItem('token');

      const res = await axios.post('http://localhost:5001/orders', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // Render the checkout form and summary
  return (
    <div style={containerStyle}>
      {/* Left Section: Checkout Form */}
      <div style={formSectionStyle}>
        <h2>Checkout</h2>
        <form onSubmit={(e) => e.preventDefault() /* prevent form refresh, no real submit yet */}>
          {/* Name fields in one row */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First Name</label>
              <input 
                type="text" 
                name="firstName" 
                required 
                style={inputStyle} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                required 
                style={inputStyle} 
              />
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label style={labelStyle}>Street Address</label>
            <input 
              type="text" 
              name="address" 
              required 
              style={inputStyle} 
            />
          </div>

          {/* Apartment/Suite (optional) */}
          <div>
            <label style={labelStyle}>Apartment/Suite <span style={{ fontWeight: 'normal' }}>(optional)</span></label>
            <input 
              type="text" 
              name="address2" 
              placeholder="Apartment, suite, unit, etc." 
              style={inputStyle} 
            />
          </div>

          {/* Town/City and Postal Code in one row */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Town/City</label>
              <input 
                type="text" 
                name="city" 
                required 
                style={inputStyle} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Postal Code</label>
              <input 
                type="text" 
                name="postalCode" 
                required 
                style={inputStyle} 
              />
            </div>
          </div>

          {/* Province/Region and Country in one row */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Province/Region</label>
              <input 
                type="text" 
                name="province" 
                required 
                style={inputStyle} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Country</label>
              <select name="country" required style={{ ...inputStyle, appearance: 'none' }}>
                {/* Country dropdown options (just a couple for example) */}
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                {/* ...other countries */}
              </select>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              required 
              style={inputStyle} 
            />
          </div>

          {/* Email Address */}
          <div>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              name="email" 
              required 
              style={inputStyle} 
            />
          </div>
        </form>
      </div>

      {/* Right Section: Order Summary */}
      <div style={summarySectionStyle}>
        <h3>Order Summary</h3>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0' }}>
            {cartItems.map((item, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>
                {/* Each item: name and price. Could also include quantity if applicable */}
                <span>{item.product?.name}</span> – <span>${item.product?.price?.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        {cartItems.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Total items:</strong> {totalQuantity}</p>
            <p><strong>Subtotal:</strong> ${subtotalPrice}</p>
          </div>
        )}
        {/* Proceed to Payment button */}
        <button 
          type="button" 
          style={buttonStyle}
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(45deg, #ff3333, #cc0000)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(45deg, #ff0000, #990000)'}
        >
          {isPlacingOrder ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="spinner" style={{
                width: '16px',
                height: '16px',
                border: '3px solid #fff',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '8px'
              }} />
              Placing Order...
            </span>
          ) : (
            'Proceed to Payment'
          )}
        </button>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <style>
      {`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      `}
      </style>
    </div>
  );
}

export default Checkout;
