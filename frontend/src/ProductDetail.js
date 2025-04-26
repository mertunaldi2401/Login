// ProductDetail.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewSection from './ReviewSection';
import axios from 'axios';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [addedToCart, setAddedToCart] = useState(false);

  const mockProducts = [
    {
      id: 1,
      name: 'Fender Stratocaster',
      model: 'Strat Classic',
      serial: 'FND-002',
      image: '/images/fender.jpg',
      price: 1299.99,
      stock: 5
    },
    {
      id: 4,
      name: 'Epiphone Matt Heafy Signature',
      model: '7 Strings',
      serial: 'GTR-001',
      image: '/images/epiphone-m-28833_1.jpg',
      price: 899.99,
      stock: 0
    },
    {
      id: 5,
      name: 'Ibanez Tim Henson Signature',
      model: 'TOD10',
      serial: 'GTR-002',
      image: '/images/ibanez-tod10.jpg',
      price: 1499.99,
      stock: 3
    },
    {
      id: 2,
      name: 'Nano Cortex',
      model: 'Nano Cortex',
      serial: 'EFF-002',
      image: '/images/19425051_800.jpg',
      price: 299.99,
      stock: 10
    },
    {
      id: 3,
      name: 'Neural DSP Quad Cortex',
      model: 'Quad Cortex',
      serial: 'EFF-001',
      image: '/images/15848351_800.jpg',
      price: 1599.99,
      stock: 2
    },
    {
      id: 6,
      name: 'Ernie Ball Paradigm',
      model: 'Paradigm Strings',
      serial: 'STR-001',
      image: '/images/images-2.jpeg',
      price: 19.99,
      stock: 20
    },
    {
      id: 7,
      name: 'Ernie Ball Regular Slinky',
      model: 'Regular Slinky',
      serial: 'STR-002',
      image: '/images/P02221_1.jpg.webp',
      price: 9.99,
      stock: 15
    }
  ];

  const productId = parseInt(id, 10);
  const product =
    mockProducts.find((p) => p.id === productId) || {
      id: 'unknown',
      name: 'Product Not Found',
      model: 'N/A',
      serial: 'N/A',
      image: '',
      price: 0,
      stock: 0
    };

  const addToCart = async () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    setAddedToCart(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5001/cart', {
        productId: product.id,
        quantity: 1
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ Product also added to backend cart.');
    } catch (err) {
      console.error('❌ Backend cart update failed:', err);
    }
  };

  // Styles
  const detailContainerStyle = {
    padding: '2rem',
    color: '#fff',
    backgroundColor: '#000',
    minHeight: '100vh'
  };

  const contentStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '2rem',
    flexWrap: 'wrap'
  };

  const imageStyle = {
    width: '400px',
    height: 'auto',
    borderRadius: '6px'
  };

  const rightSideStyle = {
    display: 'flex',
    flex: 1,
    gap: '2rem'
  };

  const infoStyle = {
    flex: 1,
    minWidth: '300px'
  };

  const reviewStyle = {
    flex: 1,
    minWidth: '300px'
  };

  const titleStyle = {
    fontSize: '2rem',
    marginBottom: '0.5rem'
  };

  const modelStyle = {
    fontStyle: 'italic',
    marginBottom: '1rem'
  };

  const priceStyle = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '1rem'
  };

  const buttonStyle = {
    background: 'rgba(255, 0, 0, 0.6)',
    padding: '0.8rem 1.2rem',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginRight: '1rem'
  };

  const backButtonStyle = {
    ...buttonStyle,
    background: 'rgba(255, 255, 255, 0.3)'
  };

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
            <p>Serial: {product.serial}</p>
            <p style={priceStyle}>Price: ${product.price.toFixed(2)}</p>

            {product.stock > 0 ? (
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
