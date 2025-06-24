import { cozeService } from './services/cozeService';
import dotenv from 'dotenv';
import { ChatEventType } from '@coze/api';

dotenv.config();

async function testCozeConnection() {
  try {
    console.log('Testing Coze API connection...');
    console.log('Environment variables status:');
    console.log('COZE_TOKEN:', process.env.COZE_TOKEN ? '✓ Set' : '✗ Not set');
    console.log('COZE_BOT_ID:', process.env.COZE_BOT_ID ? '✓ Set' : '✗ Not set');
    
    // Debug: Print first few characters of token (for security)
    if (process.env.COZE_TOKEN) {
      console.log('Token starts with:', process.env.COZE_TOKEN.substring(0, 10) + '...');
    }
    if (process.env.COZE_BOT_ID) {
      console.log('Bot ID:', process.env.COZE_BOT_ID);
    }
    console.log('COZE_TOKEN:', process.env.COZE_TOKEN, 'COZE_BOT_ID:', process.env.COZE_BOT_ID);

    // Test sending a regular message
    const testMessage = 'Hello, how are you?';
    console.log('\nTesting regular message:');
    console.log('Sending message:', testMessage);
    const response = await cozeService.sendMessage(testMessage);
    
    if (response.success && response.data) {
      console.log('\nBot response:');
      console.log('Main answer:', response.data.message);
      
      if (response.data.followUpQuestions && response.data.followUpQuestions.length > 0) {
        console.log('\nFollow-up questions (would be displayed as buttons):');
        response.data.followUpQuestions.forEach((question, index) => {
          console.log(`${index + 1}. ${question}`);
        });
      }
    } else {
      console.log('Error response:', response);
    }

    // Test streaming message
    const streamMessage = 'Tell me a short story';
    console.log('\nTesting streaming message:');
    console.log('Sending message:', streamMessage);
    const stream = await cozeService.streamMessage(streamMessage);
    let fullResponse = '';
    
    console.log('\nBot response:');
    for await (const chunk of stream) {
      if (chunk.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
        const content = chunk.data.content || '';
        fullResponse += content;
        process.stdout.write(content);
      } else if (chunk.event === ChatEventType.ERROR) {
        console.error('\nError:', chunk.data.msg);
      }
    }
    console.log('\n'); // Just add a newline at the end

    // Test clearing history
    console.log('\nTesting clear history:');
    // Note: In a real application, you would need to get the conversation ID from somewhere
    // For testing purposes, we'll use a dummy ID
    const testConversationId = 'test-conversation-id';
    await cozeService.clearHistory(testConversationId);
    console.log('History cleared successfully');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCozeConnection(); 