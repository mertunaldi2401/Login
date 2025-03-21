// ProductDetail.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Extended mock data with price and images matching Products.js
  const mockProducts = [
    {
      id: 1,
      name: 'Fender Stratocaster',
      model: 'Strat Classic',
      serial: 'FND-002',
      image: '/images/1228000110250840_1.jpg.webp',
      price: 1299.99
    },
    {
      id: 4,
      name: 'Epiphone Matt Heafy Signature',
      model: '7 Strings',
      serial: 'GTR-001',
      image: '/images/epiphone-m-28833_1.jpg',
      price: 899.99
    },
    {
      id: 5,
      name: 'Ibanez Tim Henson Signature',
      model: 'TOD10',
      serial: 'GTR-002',
      image: '/images/ibanez-tod10.jpg',
      price: 1499.99
    },
    {
      id: 2,
      name: 'Nano Cortex',
      model: 'Nano Cortex',
      serial: 'EFF-002',
      image: '/images/19425051_800.jpg',
      price: 299.99
    },
    {
      id: 3,
      name: 'Neural DSP Quad Cortex',
      model: 'Quad Cortex',
      serial: 'EFF-001',
      image: '/images/15848351_800.jpg',
      price: 1599.99
    },
    {
      id: 6,
      name: 'Ernie Ball Paradigm',
      model: 'Paradigm Strings',
      serial: 'STR-001',
      image: '/images/images-2.jpeg',
      price: 19.99
    },
    {
      id: 7,
      name: 'Ernie Ball Regular Slinky',
      model: 'Regular Slinky',
      serial: 'STR-002',
      image: '/images/P02221_1.jpg.webp',
      price: 9.99
    }
  ];

  // Convert id to number if necessary (since product.id is a number above)
  const productId = parseInt(id, 10);

  // Find product by id or fallback
  const product =
    mockProducts.find((p) => p.id === productId) || {
      id: 'unknown',
      name: 'Product Not Found',
      model: 'N/A',
      serial: 'N/A',
      image: '',
      price: 0
    };

  const addToCart = () => {
    // Retrieve existing cart or create new
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Added ${product.name} to cart!`);
  };

  const detailContainerStyle = {
    padding: '2rem',
    color: '#fff',
    backgroundColor: '#000', // Dark background
    minHeight: '100vh'
  };

  const contentStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '2rem'
  };

  const imageStyle = {
    width: '400px',
    height: 'auto',
    borderRadius: '6px'
  };

  const infoStyle = {
    maxWidth: '500px'
  };

  const titleStyle = {
    fontSize: '2rem',
    marginBottom: '0.5rem'
  };

  const modelStyle = {
    fontStyle: 'italic',
    marginBottom: '1rem'
  };

  const descriptionStyle = {
    marginBottom: '2rem'
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
        {product.image ? (
          <img src={product.image} alt={product.name} style={imageStyle} />
        ) : null}

        {/* Product Info */}
        <div style={infoStyle}>
          <h1 style={titleStyle}>{product.name}</h1>
          <h2 style={modelStyle}>Model: {product.model}</h2>
          <p>Serial: {product.serial}</p>
          <p style={priceStyle}>Price: ${product.price.toFixed(2)}</p>
          <button style={buttonStyle} onClick={addToCart}>
            Add to Cart
          </button>
          <button
            style={backButtonStyle}
            onClick={() => navigate(-1)} // go back
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
