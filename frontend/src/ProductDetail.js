import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewSection from './ReviewSection';
import StarRating from './StarRating';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [addedToCart, setAdded]  = useState(false);
  const [quantity, setQuantity] = useState(1);

  // 🔥 Fetch from the correct endpoint (/products/:id)
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5001/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        setLoading(false);
      });
  }, [id]);

  const addToCart = async () => {
    // ... your existing cart logic ...
  };

  if (loading) return <p style={{ textAlign:'center', marginTop:'2rem' }}>Loading...</p>;
  if (!product) return <p style={{ textAlign:'center', marginTop:'2rem' }}>Product not found.</p>;

  return (
    <div style={{ padding:'2rem', background:'#000', color:'#fff', minHeight:'100vh' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom:'1rem' }}>
        Go Back
      </button>
      <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap' }}>
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            style={{ width:'400px', borderRadius:'6px' }}
          />
        )}
        <div style={{ flex:1, minWidth:'300px' }}>
          <h1>{product.name}</h1>
          <StarRating rating={product.averageRating||0} editable={false} />
          {product.numReviews > 0 && <p>({product.numReviews} Reviews)</p>}
          <p>{product.description}</p>

          {product.discountPercentage > 0 ? (
            <h2>
              <span style={{
                textDecoration:'line-through',
                color:'#aaa', marginRight:'0.5rem'
              }}>
                ${product.originalPrice?.toFixed(2)}
              </span>
              <span>${product.price.toFixed(2)}</span>
            </h2>
          ) : (
            <h2>${product.price.toFixed(2)}</h2>
          )}

          <p>Stock: {product.quantityInStock}</p>
          {product.quantityInStock > 0 && (
            <select
              value={quantity}
              onChange={e => setQuantity(+e.target.value)}
              style={{ padding:'0.5rem', marginTop:'1rem', borderRadius:'4px' }}
            >
              {[...Array(Math.min(product.quantityInStock, 10)).keys()].map(x => (
                <option key={x+1} value={x+1}>{x+1}</option>
              ))}
            </select>
          )}

          <div style={{ marginTop:'1rem' }}>
            {product.quantityInStock > 0 ? (
              addedToCart ? (
                <span style={{ color:'limegreen', fontWeight:'bold' }}>
                  Added to Cart
                </span>
              ) : (
                <button
                  onClick={addToCart}
                  style={{
                    background:'rgba(255,0,0,0.6)',
                    padding:'0.8rem 1.2rem',
                    border:'none',
                    borderRadius:'4px',
                    color:'#fff',
                    cursor:'pointer'
                  }}
                >
                  Add to Cart
                </button>
              )
            ) : (
              <span style={{ color:'red', fontWeight:'bold' }}>Out of Stock</span>
            )}
          </div>
        </div>
      </div>
      <ReviewSection />
    </div>
  );
}
