import { CozeService } from './services/cozeService';
import dotenv from 'dotenv';

dotenv.config();

async function testCozeConnection() {
  console.log('Testing Coze API connection...');
  
  // Log environment variables status
  console.log('Environment variables:', {
    apiKey: process.env.COZE_API_KEY ? 'Set' : 'Not set',
    botId: process.env.COZE_BOT_ID ? 'Set' : 'Not set',
    userId: process.env.COZE_USER_ID ? 'Set' : 'Not set',
    apiUrl: process.env.COZE_API_URL || 'Using default'
  });

  const cozeService = new CozeService();

  try {
    const response = await cozeService.sendMessage('Hello, this is a test message');
    console.log('Test successful! Response:', response);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCozeConnection(); 