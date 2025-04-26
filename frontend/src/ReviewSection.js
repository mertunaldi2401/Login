// components/ReviewSection.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function ReviewSection() {
  const { id } = useParams(); // ürün id'si
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [refresh, setRefresh] = useState(false); // refresh tetikleyici

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/products/${id}/reviews`);
        const approvedReviews = res.data.filter(review => review.approved); // 🔥 sadece approved olanlar
        setReviews(approvedReviews);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };

    fetchReviews();
  }, [id, refresh]);

  const submitReview = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/products/${id}/reviews`, {
        rating,
        comment
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setRating(0);
      setComment('');
      alert('Review submitted! Waiting for admin approval.');
      setRefresh(prev => !prev); // refresh yorumları çekmek için
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('You can comment after you receive your product.');
    }
  };

  const stars = (starCount) => {
    return '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
  };

  return (
    <div>
      <h2>Review the Product</h2>
      <div>
        <p>Rating:</p>
        {[1, 2, 3, 4, 5].map(num => (
          <span
            key={num}
            style={{ cursor: 'pointer', fontSize: '24px', color: rating >= num ? 'gold' : 'gray' }}
            onClick={() => setRating(num)}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Please share your experience here"
        rows={4}
        style={{ width: '100%', marginTop: '10px' }}
      />
      <button
        style={{
          background: '#8B0000',
          padding: '0.8rem 1.2rem',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          marginTop: '10px'
        }}
        onClick={submitReview}
      >
        Submit Review
      </button>

      <h3 style={{ marginTop: '2rem' }}>All Reviews</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review._id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
            <div style={{ fontSize: '20px', color: 'gold' }}>{stars(review.rating)}</div>
            <p>{review.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default ReviewSection;