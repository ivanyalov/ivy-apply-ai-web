import express, { Request, Response } from 'express';
import { cozeService } from '../services/cozeService';
import { ChatEventType } from '@coze/api';

const router = express.Router();

// Regular message endpoint
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body;
    const response = await cozeService.sendMessage(message, conversationHistory);
    res.json(response);
  } catch (error) {
    console.error('Error in /message endpoint:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Streaming endpoint
router.post('/stream', async (req: Request, res: Response) => {
  const { message, conversationHistory } = req.body;

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Send start event
    res.write(`data: ${JSON.stringify({ type: 'start' })}\n\n`);

    const stream = await cozeService.streamMessage(message, conversationHistory);
    
    for await (const chunk of stream) {
      if (chunk.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
        // Send delta event with content
        res.write(`data: ${JSON.stringify({
          type: 'delta',
          content: chunk.data.content
        })}\n\n`);
      } else if (chunk.event === ChatEventType.CONVERSATION_MESSAGE_COMPLETED) {
        // Send done event
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      }
    }
  } catch (error) {
    console.error('Error in /stream endpoint:', error);
    // Send error event
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })}\n\n`);
  } finally {
    res.end();
  }
});

// Clear history endpoint
router.delete('/clear/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    await cozeService.clearHistory(conversationId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /clear endpoint:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

export default router; 