import express from 'express';
import cors from 'cors';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import coursesRoutes from './routes/courses.js';
import chaptersRoutes from './routes/chapters.js';
import lessonsRoutes from './routes/lessons.js';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/lessons', lessonsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to LL Pro Admin API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
}); 