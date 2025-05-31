import express from 'express';

const router = express.Router();

// Mock user credentials
const users = [
  {
    id: '1',
    username: 'admin',
    password: 'admin',
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    id: '2',
    username: 'user1',
    password: 'user123',
    email: 'user1@example.com',
    role: 'editor'
  }
];

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(
    u => u.username === username && u.password === password
  );
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // In a real app, you would generate a JWT token here
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;
  
  // Return user info without password and with token
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    user: userWithoutPassword,
    token,
    expiresIn: 3600 // 1 hour
  });
});

// Logout route
router.post('/logout', (req, res) => {
  // In a real app, you would invalidate the token
  res.json({ message: 'Logged out successfully' });
});

// Get current user info
router.get('/me', (req, res) => {
  // In a real app, you would verify the token and get the user from it
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  const userId = token.split('-')[2]; // Extract user ID from mock token
  
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  
  res.json(userWithoutPassword);
});

export default router; 