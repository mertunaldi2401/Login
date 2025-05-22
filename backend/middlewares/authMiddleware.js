// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;


const authenticateToken = (req, res, next) => {
  console.log('Incoming auth header:', req.headers.authorization);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id, // Burada id'yi doğru şekilde ayarlıyoruz
      username: decoded.username,
      email: decoded.email,
      role: decoded.role // <-- add this line
    };

    // Log to check if user is correctly decoded
    console.log('Decoded user:', req.user);
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authenticateToken;