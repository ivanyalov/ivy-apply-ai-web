import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface CozeConfig {
  apiKey: string;
  botId: string;
  baseUrl: string;
}

interface CozeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CozeResponse {
  message: string;
  sessionId?: string;
}

export class CozeService {
  private config: CozeConfig;
  private axiosInstance;

  constructor() {
    this.config = {
      apiKey: process.env.COZE_API_KEY || '',
      botId: process.env.COZE_BOT_ID || '',
      baseUrl: process.env.COZE_API_URL || 'https://api.coze.com/v1'
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async sendMessage(message: string, sessionId?: string): Promise<CozeResponse> {
    try {
      const response = await this.axiosInstance.post(`/bots/${this.config.botId}/chat`, {
        messages: [{
          role: 'user',
          content: message
        }],
        session_id: sessionId
      });

      return {
        message: response.data.message,
        sessionId: response.data.session_id
      };
    } catch (error) {
      console.error('Error sending message to Coze:', error);
      throw new Error('Failed to send message to Coze');
    }
  }

  async uploadFile(file: Buffer, fileName: string, sessionId?: string): Promise<CozeResponse> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([file]), fileName);
      if (sessionId) {
        formData.append('session_id', sessionId);
      }

      const response = await this.axiosInstance.post(
        `/bots/${this.config.botId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return {
        message: response.data.message,
        sessionId: response.data.session_id
      };
    } catch (error) {
      console.error('Error uploading file to Coze:', error);
      throw new Error('Failed to upload file to Coze');
    }
  }

  async clearSession(sessionId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/bots/${this.config.botId}/sessions/${sessionId}`);
    } catch (error) {
      console.error('Error clearing Coze session:', error);
      throw new Error('Failed to clear Coze session');
    }
  }
} 