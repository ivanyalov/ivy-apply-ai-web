import { CozeAPI } from '@coze/api';
import dotenv from 'dotenv';

dotenv.config();

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  content_type: 'text';
  type?: 'answer' | 'follow_up' | 'verbose';
}

interface ChatResponse {
  messages: ChatMessage[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class CozeService {
  private client: CozeAPI;
  private botId: string;

  constructor() {
    if (!process.env.COZE_TOKEN) {
      throw new Error('COZE_TOKEN is not defined in environment variables');
    }
    if (!process.env.COZE_BOT_ID) {
      throw new Error('COZE_BOT_ID is not defined in environment variables');
    }

    this.client = new CozeAPI({
      token: process.env.COZE_TOKEN,
    });
    this.botId = process.env.COZE_BOT_ID;
  }

  async sendMessage(message: string, conversationHistory: any[] = []) {
    try {
      const response = await this.client.chat.createAndPoll({
        bot_id: this.botId,
        additional_messages: [
          ...conversationHistory,
          {
            role: 'user',
            content: message,
            content_type: 'text'
          }
        ],
        auto_save_history: true,
        meta_data: {}
      });
console.log(response);
      if (!response.messages || response.messages.length === 0) {
        throw new Error('No response received from Coze API');
      }

      // Find the main answer message
      const mainAnswer = response.messages.find(msg => msg.type === 'answer');
      
      // Find all follow-up questions
      const followUps = response.messages
        .filter(msg => msg.type === 'follow_up')
        .map(msg => msg.content);
      
      return {
        success: true,
        data: {
          message: mainAnswer?.content || 'No answer received',
          followUpQuestions: followUps,
          usage: response.usage
        }
      };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async streamMessage(message: string, conversationHistory: any[] = []) {
    try {
      const stream = await this.client.chat.stream({
        bot_id: this.botId,
        additional_messages: [
          ...conversationHistory,
          {
            role: 'user',
            content: message,
            content_type: 'text'
          }
        ]
      });

      return stream;
    } catch (error) {
      console.error('Error in streamMessage:', error);
      throw error;
    }
  }

  async clearHistory(conversationId: string) {
    try {
      // Note: Implement this method when Coze API provides a way to clear history
      return {
        success: true,
        message: 'Chat history cleared'
      };
    } catch (error) {
      console.error('Error in clearHistory:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const cozeService = new CozeService(); 