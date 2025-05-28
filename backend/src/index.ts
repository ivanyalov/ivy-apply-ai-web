import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path'; // Import path module
import chatRoutes from './routes/chat';
import authRoutes from './routes/auth';
import paymentRoutes from './routes/payment.routes';
import subscriptionRoutes from './routes/subscription.routes';
import { pool } from './config/database';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000; // Backend typically runs on a different port e.g. 8000

// Middleware
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Enable CORS
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Ivy Apply AI Backend (Express.js + TypeScript)' });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
