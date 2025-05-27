import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path'; // Import path module
import chatRoutes from './routes/chat';

const app: Express = express();
const port = process.env.PORT || 8000; // Backend typically runs on a different port e.g. 8000

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

// Chat routes
app.use('/api', chatRoutes);

// Placeholder API Endpoints
app.post('/start-trial', (req: Request, res: Response) => {
  // TODO: Implement free trial activation logic
  res.status(200).json({ message: 'Free trial started (placeholder)' });
});

app.post('/subscribe', (req: Request, res: Response) => {
  // TODO: Implement YooKassa redirection or subscription logic
  res.status(200).json({ message: 'Subscription process initiated (placeholder)' });
});

app.get('/validate-access', (req: Request, res: Response) => {
  // TODO: Implement access validation logic (trial or subscription)
  res.status(200).json({ message: 'Access status validated (placeholder)', accessGranted: false });
});

app.post('/upload-file', (req: Request, res: Response) => {
  // TODO: Implement file upload logic (e.g., using multer, then forward to Coze/Jules)
  res.status(200).json({ message: 'File upload received (placeholder)' });
});

app.post('/clear-session', (req: Request, res: Response) => {
  // TODO: Implement session clearing logic
  res.status(200).json({ message: 'Session cleared (placeholder)' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
