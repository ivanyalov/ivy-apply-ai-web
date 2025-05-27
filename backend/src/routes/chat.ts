import { Router, Request, Response } from 'express';
import multer from 'multer';
import { CozeService } from '../services/cozeService';

const router = Router();
const cozeService = new CozeService();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Chat endpoint
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const response = await cozeService.sendMessage(message, sessionId);
    res.json(response);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// File upload endpoint
router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { sessionId } = req.body;
    const response = await cozeService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      sessionId
    );
    
    res.json(response);
  } catch (error) {
    console.error('Error in upload endpoint:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Clear session endpoint
router.post('/clear-session', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    await cozeService.clearSession(sessionId);
    res.json({ message: 'Session cleared successfully' });
  } catch (error) {
    console.error('Error in clear-session endpoint:', error);
    res.status(500).json({ error: 'Failed to clear session' });
  }
});

export default router; 