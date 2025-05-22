import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';  // Düzeltilmiş import

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
        const approvedReviews = res.data.filter(review => review.approved);
        setReviews(approvedReviews);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };

    fetchReviews();
  }, [id, refresh]);

  // Listen for "reviewRefresh" events (set in ProductManager after approval)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'reviewRefresh') {
        setRefresh(prev => !prev);          // trigger re-fetch
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const submitReview = async () => {
    try {
      const token = localStorage.getItem('token'); // token burada çekiliyor
      if (!token) {
        alert('You need to be logged in to submit a review.');
        return;
      }

      // token'ı decode ederek userId'yi alıyoruz
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      console.log('Sending review:', { rating, comment, userId }); // console log ekledim

      const res = await axios.post(
        `http://localhost:5001/products/${id}/reviews`,
        {
          productId: id,
          rating,
          comment,
          userId, // userId'yi ekliyoruz
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setRating(0);
      setComment('');
      if (res?.data?.message && res.data.message.includes('Waiting')) {
        alert(res.data.message); // Yalnızca onay bekleyen yorumlar için göster
      }
      setRefresh(prev => !prev);
    } catch (err) {
      console.error('Error submitting review:', err.response?.data || err.message);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Error submitting review.');
      }
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