import express from 'express';
import cors from 'cors';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to LL Pro Admin API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
}); 