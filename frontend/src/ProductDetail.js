import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewSection from './ReviewSection';
import axios from 'axios';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5001/products/${id}`) // <-- Tek ürünü çekiyoruz
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

  const addToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/cart', {
        productId: product._id,
        quantity: 1
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setAddedToCart(true);
      alert('✅ Product added to cart successfully!');
    } catch (err) {
      console.error('❌ Backend cart update failed:', err.response?.data || err.message);
      alert('Failed to add product to cart.');
    }
  };

  // Styles (seninkileri aynen korudum)
  const detailContainerStyle = { padding: '2rem', color: '#fff', backgroundColor: '#000', minHeight: '100vh' };
  const contentStyle = { display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' };
  const imageStyle = { width: '400px', height: 'auto', borderRadius: '6px' };
  const rightSideStyle = { display: 'flex', flex: 1, gap: '2rem' };
  const infoStyle = { flex: 1, minWidth: '300px' };
  const reviewStyle = { flex: 1, minWidth: '300px' };
  const titleStyle = { fontSize: '2rem', marginBottom: '0.5rem' };
  const modelStyle = { fontStyle: 'italic', marginBottom: '1rem' };
  const priceStyle = { fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' };
  const buttonStyle = { background: 'rgba(255, 0, 0, 0.6)', padding: '0.8rem 1.2rem', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', marginRight: '1rem' };
  const backButtonStyle = { ...buttonStyle, background: 'rgba(255, 255, 255, 0.3)' };

  if (loading) {
    return <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>Loading product...</p>;
  }

  if (!product) {
    return <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>Product not found.</p>;
  }

  return (
    <div style={detailContainerStyle}>
      <div style={contentStyle}>
        {/* Product Image */}
        {product.image && (
          <img src={product.image} alt={product.name} style={imageStyle} />
        )}

        {/* Right Side: Info and Review side-by-side */}
        <div style={rightSideStyle}>
          {/* Product Info */}
          <div style={infoStyle}>
            <h1 style={titleStyle}>{product.name}</h1>
            <h2 style={modelStyle}>Model: {product.model}</h2>
            <p>Serial: {product.serialNumber}</p>
            <p style={priceStyle}>Price: ${product.price}</p>

            {product.quantityInStock > 0 ? (
              addedToCart ? (
                <span style={{ color: 'limegreen', fontWeight: 'bold', marginRight: '1rem' }}>
                  Added to Cart
                </span>
              ) : (
                <button style={buttonStyle} onClick={addToCart}>
                  Add to Cart
                </button>
              )
            ) : (
              <span style={{ color: 'red', fontWeight: 'bold', marginRight: '1rem' }}>
                Out of Stock
              </span>
            )}

            <button style={backButtonStyle} onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>

          {/* Review Section fills right side */}
          <div style={reviewStyle}>
            <ReviewSection />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;