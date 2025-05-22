import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';

export default function Products({
  searchQuery = '',
  categoryFilter = '',
  sortOrder = '',
  setSortOrder
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5001/products')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const q = searchQuery.toLowerCase();
  let filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.model && p.model.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q));
    const matchesCategory =
      !categoryFilter ||
      p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Sort logic
  if (sortOrder === 'high-to-low') filtered.sort((a, b) => b.price - a.price);
  if (sortOrder === 'low-to-high') filtered.sort((a, b) => a.price - b.price);
  if (sortOrder === 'popularity')
    filtered.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0));
  if (sortOrder === 'rating-high-to-low')
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading products...</p>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
      {filtered.map(p => (
        <Link
          key={p._id}
          to={`/product/${p._id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div
            style={{
              background: '#111',
              color: '#fff',
              padding: '1rem',
              borderRadius: '8px',
              width: '220px',
              position: 'relative'
            }}
          >
            {p.discountPercentage > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  background: '#d50000',
                  padding: '0.2rem 0.5rem',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  borderRadius: '0 0 4px 0'
                }}
              >
                -{p.discountPercentage}%
              </div>
            )}

            <img
              src={p.image}
              alt={p.name}
              style={{ width: '100%', borderRadius: '4px' }}
            />
            <h3 style={{ margin: '0.5rem 0' }}>{p.name}</h3>
            <StarRating rating={p.rating || 0} editable={false} />

            {p.discountPercentage > 0 ? (
              <p>
                <span
                  style={{
                    textDecoration: 'line-through',
                    color: '#aaa',
                    marginRight: '0.5rem'
                  }}
                >
                  ${p.originalPrice?.toFixed(2)}
                </span>
                <span>${p.price.toFixed(2)}</span>
              </p>
            ) : (
              <p>${p.price.toFixed(2)}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
