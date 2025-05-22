import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewSection from './ReviewSection';
import StarRating from './StarRating';
import axios from 'axios';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5001/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch product:', err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!product || !token) return;
    (async () => {
      try {
        const res = await fetch('http://localhost:5001/wishlist', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const list = await res.json();
        setInWishlist(list.some(item => item._id === product._id));
      } catch (err) {
        console.error('Wishlist fetch failed:', err);
      }
    })();
  }, [product, token]);

  const addToCart = async () => {
    try {
      const headers = {};
      const token = localStorage.getItem('token');

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        let guestId = localStorage.getItem('guestId');
        if (!guestId) {
          guestId = Math.random().toString(36).substring(2);
          localStorage.setItem('guestId', guestId);
        }
        headers['x-guest-session'] = guestId;
      }

      const res = await axios.post(
        'http://localhost:5001/cart',
        { productId: product._id, quantity },
        { headers }
      );

      if (res.data.guestSessionId) {
        localStorage.setItem('guestId', res.data.guestSessionId);
      }

      setAddedToCart(true);
      alert(`✅ Added ${quantity} item(s) to cart successfully!`);
    } catch (err) {
      console.error('❌ Backend cart update failed:', err.response?.data || err.message);
      alert('Failed to add product to cart.');
    }
  };

  const toggleWishlist = async () => {
    if (!token) {
      alert('Please log in to manage your wishlist.');
      return;
    }
    try {
      const method = inWishlist ? 'DELETE' : 'POST';
      const res = await fetch(`http://localhost:5001/wishlist/${product._id}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Wishlist update failed');
      setInWishlist(!inWishlist);
    } catch (err) {
      alert(err.message);
    }
  };

  const detailContainerStyle = { padding: '2rem', color: '#fff', backgroundColor: '#000', minHeight: '100vh' };
  const contentStyle = { display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' };
  const imageStyle = { width: '400px', height: 'auto', borderRadius: '6px' };
  const rightSideStyle = { display: 'flex', flex: 1, gap: '2rem' };
  const infoStyle = { flex: 1, minWidth: '300px' };
  const reviewStyle = { flex: 1, minWidth: '300px' };
  const titleStyle = { fontSize: '2rem', marginBottom: '0.5rem' };
  const modelStyle = { fontStyle: 'italic', marginBottom: '1rem' };
  const priceStyle = { fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' };
  const buttonStyle = { background: 'rgba(255, 0, 0, 0.6)', padding: '0.8rem 1.2rem', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', marginTop: '1rem', marginRight: '1rem' };
  const backButtonStyle = { ...buttonStyle, background: 'rgba(255, 255, 255, 0.3)' };
  const selectStyle = { padding: '0.5rem', marginTop: '1rem', borderRadius: '4px', fontSize: '1rem', background: '#fff', color: '#000' };

  if (loading) return <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>Loading product...</p>;
  if (!product) return <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>Product not found.</p>;

  const calculatedOriginal = product.originalPrice || (product.price / (1 - product.discountPercentage / 100));

  return (
    <div style={detailContainerStyle}>
      <div style={contentStyle}>
        {product.image && <img src={product.image} alt={product.name} style={imageStyle} />}
        <div style={rightSideStyle}>
          <div style={infoStyle}>
            <h1 style={titleStyle}>{product.name}</h1>

            <div style={{ marginTop: '0.5rem' }}>
              <StarRating rating={product.averageRating || 0} editable={false} />
              <div style={{ fontSize: '1.2rem', marginTop: '0.3rem' }}>
                {product.averageRating ? `${product.averageRating}` : 'No rating yet'}
              </div>
              {product.numReviews > 0 && (
                <div style={{ fontSize: '0.9rem', color: '#bbb' }}>
                  ({product.numReviews} Reviews)
                </div>
              )}
            </div>

            <h2 style={modelStyle}>Model: {product.model}</h2>
            <p>Serial: {product.serialNumber}</p>
            <h2>Description: {product.description}</h2>

            {product.discountPercentage > 0 ? (
              <>
                <h2 style={{ textDecoration: 'line-through', color: '#bbb', fontSize: '1.1rem' }}>
                  Original Price: ${calculatedOriginal.toFixed(2)}
                </h2>
                <h2 style={{ color: '#00e676', fontWeight: 'bold' }}>
                  Discounted Price: ${product.price?.toFixed(2)}{' '}
                  <span style={{ color: '#ff5252', fontSize: '1rem' }}>({product.discountPercentage}% OFF)</span>
                </h2>
              </>
            ) : (
              <h2 style={priceStyle}>Price: ${product.price?.toFixed(2)}</h2>
            )}

            <p>Stock: {product.quantityInStock}</p>

            {product.quantityInStock > 0 && (
              <select
                style={selectStyle}
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value))}
              >
                {[...Array(Math.min(product.quantityInStock, 10)).keys()].map(x => (
                  <option key={x + 1} value={x + 1}>{x + 1}</option>
                ))}
              </select>
            )}

            <div style={{ marginTop: '1rem' }}>
              {product.quantityInStock > 0 ? (
                addedToCart ? (
                  <span style={{ color: 'limegreen', fontWeight: 'bold', marginRight: '1rem' }}>
                    Added to Cart
                  </span>
                ) : (
                  <button style={buttonStyle} onClick={addToCart}>Add to Cart</button>
                )
              ) : (
                <span style={{ color: 'red', fontWeight: 'bold', marginRight: '1rem' }}>Out of Stock</span>
              )}

              <button onClick={toggleWishlist} style={{
                background: inWishlist ? '#c0392b' : '#27ae60',
                color: '#fff',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginRight: '1rem'
              }}>
                {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>

              <button style={backButtonStyle} onClick={() => navigate(-1)}>Go Back</button>
            </div>
          </div>
          <div style={reviewStyle}><ReviewSection /></div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
