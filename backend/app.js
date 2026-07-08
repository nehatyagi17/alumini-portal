import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import { createServer } from 'http';
import { initSocket } from './services/socket.js';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import alumniRoutes from './routes/alumni.js';
import studentRoutes from './routes/student.js';
import messageRoutes from './routes/messages.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/messages', messageRoutes);

// Global Error Handler
app.use(errorHandler);

// Test DB Connection and Start Server
pool.query('SELECT NOW()')
  .then(() => {
    console.log('Database connected successfully.');
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed.', err.stack);
  });