const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_jwt_secret'; // In production, store in env var

app.use(cors());
app.use(express.json());

// In-memory user store (array of user objects)
let users = [];

/* =======================
   Existing Auth Routes
   ======================= */
app.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User with this username or email already exists.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, email, password: hashedPassword };
    users.push(newUser);
    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('Error registering user:', err);
    return res.status(500).json({ message: 'Error registering user.' });
  }
});

app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/email and password are required.' });
  }
  // Check if 'identifier' matches either username or email
  const user = users.find(u => u.username === identifier || u.email === identifier);
  if (!user) {
    return res.status(400).json({ message: 'Invalid username/email or password.' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid username/email or password.' });
  }
  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: `Welcome, ${user.username}!`, token });
});

/* ===========================
   Admin Routes (UNSECURED)
   =========================== */

/**
 * GET /admin/users
 * Returns the entire list of users in memory
 */
app.get('/admin/users', (req, res) => {
  // For privacy, we might NOT want to return hashed passwords,
  // but for demonstration, let's show everything
  return res.json(users);
});

/**
 * DELETE /admin/users/:username
 * Deletes a single user by username
 */
app.delete('/admin/users/:username', (req, res) => {
  const { username } = req.params;
  const initialLength = users.length;
  users = users.filter(u => u.username !== username);
  if (users.length === initialLength) {
    return res.status(404).json({ message: 'User not found.' });
  }
  return res.json({ message: `User '${username}' deleted successfully.` });
});

/**
 * DELETE /admin/users
 * Deletes ALL users
 */
app.delete('/admin/users', (req, res) => {
  users = [];
  return res.json({ message: 'All users have been deleted.' });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
