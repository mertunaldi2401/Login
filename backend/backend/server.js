const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_jwt_secret'; // Use env var in production

app.use(cors());
app.use(express.json());

// In-memory "database" for users
const users = {};

// Registration route
app.post('/register', async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }
  if (users[username]) {
    return res.status(400).json({ message: 'User already exists.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = hashedPassword;
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user.' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  const storedPassword = users[username];
  if (!storedPassword) {
    return res.status(400).json({ message: 'Invalid username or password.' });
  }
  const isMatch = await bcrypt.compare(password, storedPassword);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid username or password.' });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: `Welcome, ${username}!`, token });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
