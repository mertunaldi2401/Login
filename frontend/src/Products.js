// ✅ Products.js (Fixed Search Filtering Fully + Added Rating Display + Discount Display)
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsUpDown } from '@fortawesome/free-solid-svg-icons';
import StarRating from './StarRating'; // ⭐ You must import StarRating component

function Products({ searchQuery = '', categoryFilter = '', sortOrder = '', setSortOrder }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = 'http://localhost:5001/products';

    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const search = searchQuery.toLowerCase();

  let filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      (product.model && product.model.toLowerCase().includes(search)) ||
      (product.serialNumber && product.serialNumber.toLowerCase().includes(search)) ||
      (product.description && product.description.toLowerCase().includes(search)) ||
      (product.category && product.category.toLowerCase().includes(search));

    const matchesCategory = !categoryFilter || product.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  if (sortOrder === 'high-to-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortOrder === 'low-to-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'popularity') {
    filteredProducts.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0));
  } else if (sortOrder === 'rating-high-to-low') {
    filteredProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  }

  const containerStyle = {
    marginTop: '3rem',
    fontFamily: '"Metal Mania", cursive',
    color: '#fff',
    position: 'relative'
  };

  const titleStyle = {
    textAlign: 'center',
    marginBottom: '1rem',
    fontSize: '3rem',
    fontWeight: 'bold',
    textShadow: '2px 2px 5px rgba(0,0,0,0.7)'
  };

  const sortContainerStyle = {
    position: 'absolute',
    top: '0',
    right: '0',
    display: 'flex',
    alignItems: 'center',
    marginRight: '1rem'
  };

  const sortDropdownStyle = {
    backgroundColor: '#111',
    color: '#fff',
    border: '1px solid #d50000',
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '5px',
    fontFamily: '"Metal Mania", cursive',
    cursor: 'pointer',
    marginLeft: '0.5rem'
  };

  const productsWrapperStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '3rem'
  };

  const productCardStyle = {
    border: '1px solid #333',
    margin: '10px',
    padding: '15px',
    width: '220px',
    height: '500px',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
    borderRadius: '6px',
    transition: 'transform 0.2s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const productImageStyle = {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '4px'
  };

  const productNameStyle = {
    fontSize: '1.2em',
    margin: '10px 0',
    color: '#fff'
  };

  const productModelStyle = {
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#ffcc00'
  };

  const productSerialStyle = {
    color: '#ccc',
    fontSize: '0.9em'
  };

  if (loading) {
    return <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>Loading products...</p>;
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>THOR'S EPIC COLLECTION</h1>

      <div style={sortContainerStyle}>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={sortDropdownStyle}
        >
          <option value="">Featured</option>
          <option value="high-to-low">Price: High to Low</option>
          <option value="low-to-high">Price: Low to High</option>
          <option value="popularity">Most Popular</option>
          <option value="rating-high-to-low">Highest Rated</option>
        </select>
        <FontAwesomeIcon icon={faArrowsUpDown} style={{ color: '#fff', fontSize: '1.5rem', marginLeft: '0.5rem' }} />
      </div>

      {filteredProducts.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>
          No products match your search or category selection.
        </p>
      ) : (
        <div style={productsWrapperStyle}>
          {filteredProducts.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={productCardStyle}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <img src={product.image} alt={product.name} style={productImageStyle} />
                <h3 style={productNameStyle}>{product.name}</h3>

                <div style={{ margin: '0.5rem 0' }}>
                  <StarRating rating={product.averageRating || 0} editable={false} />
                  <div style={{ fontSize: '1rem', marginTop: '0.2rem' }}>
                    {product.averageRating ? `${product.averageRating}` : 'No rating yet'}
                  </div>
                  {product.numReviews > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#bbb' }}>
                      ({product.numReviews} Reviews)
                    </div>
                  )}
                </div>

                <p style={productModelStyle}>Model: {product.model}</p>
                <p style={productSerialStyle}>Serial: {product.serialNumber}</p>

                {/* ✅ Discount logic below */}
                {product.discountPercentage > 0 ? (
                  <div>
                    <p style={{ textDecoration: 'line-through', color: '#bbb', margin: 0 }}>
                      ${product.originalPrice?.toFixed(2) || (product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
                    </p>
                    <p style={{ color: '#00e676', fontWeight: 'bold', margin: 0 }}>
                      ${product.price?.toFixed(2)} &nbsp;
                      <span style={{ fontSize: '0.9rem', color: '#ff5252' }}>
                        ({product.discountPercentage}% OFF)
                      </span>
                    </p>
                  </div>
                ) : (
                  <p style={productSerialStyle}>Price: ${product.price?.toFixed(2)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
