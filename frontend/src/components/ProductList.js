// frontend/src/components/ProductList.js
import React from 'react';

export default function ProductList({ products, onDelete }) {
  if (!Array.isArray(products) || products.length === 0) {
    return <p>No products available.</p>;
  }

  return (
    <>
      {products.map(product => (
        <div key={product._id} style={{
          background: '#fff',
          marginBottom: '1rem',
          padding: '1rem',
          borderRadius: '5px',
          boxShadow: '0 0 5px rgba(0,0,0,0.1)'
        }}>
          <p><strong>Name:</strong> {product.name}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Price:</strong> ${product.price}</p>
          <p><strong>Cost:</strong> ${product.cost}</p>
          {onDelete && (
            <button
              onClick={() => onDelete(product._id)}
              style={{
                background: '#e74c3c',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete Product
            </button>
          )}
        </div>
      ))}
    </>
  );
}