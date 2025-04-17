// StarRating.jsx
import React, { useState } from 'react';

const StarRating = ({ rating, setRating, editable = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hover || rating);
        return (
          <span
            key={star}
            style={{ 
              cursor: editable ? 'pointer' : 'default', 
              fontSize: '1.5rem', 
              color: isFilled ? '#ffc107' : '#e4e5e9' 
            }}
            onClick={editable ? () => setRating(star) : null}
            onMouseEnter={editable ? () => setHover(star) : null}
            onMouseLeave={editable ? () => setHover(0) : null}
          >
            {isFilled ? '★' : '☆'}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
