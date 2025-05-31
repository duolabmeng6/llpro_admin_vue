import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock users data
let users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    role: 'editor',
    status: 'active',
    createdAt: '2023-01-02T00:00:00.000Z'
  },
  {
    id: '3',
    username: 'user2',
    email: 'user2@example.com',
    role: 'viewer',
    status: 'inactive',
    createdAt: '2023-01-03T00:00:00.000Z'
  }
];

// Get all users
router.get('/', (req, res) => {
  res.json(users);
});

// Get user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

// Create new user
router.post('/', (req, res) => {
  const newUser = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user
router.put('/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  users[index] = {
    ...users[index],
    ...req.body,
    id: users[index].id // Ensure ID doesn't change
  };
  
  res.json(users[index]);
});

// Delete user
router.delete('/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const deletedUser = users[index];
  users = users.filter(u => u.id !== req.params.id);
  
  res.json(deletedUser);
});

export default router; 