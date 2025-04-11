// ReviewSection.jsx
import React, { useState } from 'react';
import StarRating from './StarRating';

const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === '') {
      alert('Please provide both a rating and a review.');
      return;
    }

    const newReview = {
      id: Date.now(),
      rating,
      comment
    };

    setReviews([...reviews, newReview]);
    setRating(0);
    setComment('');
  };

  return (
    <div className="review-section" style={{ color: '#fff' }}>
      <h3>Review the Product</h3>

      {/* Form for new review */}
      <form 
        onSubmit={handleSubmit} 
        style={{
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem', 
          maxWidth: '400px',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Rating:
          </label>
          <StarRating rating={rating} setRating={setRating} editable={true} />
        </div>

        <div>
          <label 
            htmlFor="review-comment" 
            style={{ display: 'block', marginBottom: '0.5rem' }}
          >
          
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Please share your experience here"
            rows="4"
            cols="50"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button 
          type="submit" 
          style={{
            background: 'rgba(255, 0, 0, 0.6)',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Submit Review
        </button>
      </form>

      {/* Display list of reviews */}
      <div className="review-list">
        <h4>All Reviews</h4>
        {reviews.length === 0 ? (
          <p>Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div 
              key={review.id} 
              style={{ 
                borderBottom: '1px solid #444', 
                padding: '10px 0' 
              }}
            >
              {/* Reuse StarRating in non-editable mode */}
              <StarRating rating={review.rating} editable={false} />
              <p>{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
