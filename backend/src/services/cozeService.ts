import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface CozeConfig {
  apiKey: string;
  botId: string;
  userId: string;
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
      userId: process.env.COZE_USER_ID || '',
      baseUrl: process.env.COZE_API_URL || 'https://api.coze.com'
    };

    // Validate configuration
    if (!this.config.apiKey) {
      console.error('COZE_API_KEY is not set in environment variables');
    }
    if (!this.config.botId) {
      console.error('COZE_BOT_ID is not set in environment variables');
    }
    if (!this.config.userId) {
      console.error('COZE_USER_ID is not set in environment variables');
    }

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Origin': 'https://www.coze.com',
        'Referer': 'https://www.coze.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15'
      }
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(request => {
      console.log('Starting Request:', {
        url: request.url,
        method: request.method,
        headers: request.headers
      });
      return request;
    });

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      response => {
        console.log('Response:', {
          status: response.status,
          data: response.data
        });
        return response;
      },
      error => {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        throw error;
      }
    );
  }

  async sendMessage(message: string, sessionId?: string): Promise<CozeResponse> {
    try {
      console.log('Sending message to Coze:', { message, sessionId });
      
      const response = await this.axiosInstance.post('/v3/chat', {
        bot_id: this.config.botId,
        user_id: this.config.userId,
        query: message,
        stream: false
      });

      console.log('Coze response:', response.data);

      return {
        message: response.data.answer || response.data.message,
        sessionId: response.data.session_id
      };
    } catch (error) {
      console.error('Error sending message to Coze:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw new Error('Failed to send message to Coze');
    }
  }

  async uploadFile(file: Buffer, fileName: string, sessionId?: string): Promise<CozeResponse> {
    try {
      console.log('Uploading file to Coze:', { fileName, sessionId });
      
      const formData = new FormData();
      formData.append('file', new Blob([file]), fileName);
      formData.append('bot_id', this.config.botId);
      formData.append('user_id', this.config.userId);
      if (sessionId) {
        formData.append('session_id', sessionId);
      }

      const response = await this.axiosInstance.post(
        '/v3/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Coze file upload response:', response.data);

      return {
        message: response.data.message,
        sessionId: response.data.session_id
      };
    } catch (error) {
      console.error('Error uploading file to Coze:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw new Error('Failed to upload file to Coze');
    }
  }

  async clearSession(sessionId: string): Promise<void> {
    try {
      console.log('Clearing Coze session:', sessionId);
      
      await this.axiosInstance.delete('/v3/session', {
        data: {
          bot_id: this.config.botId,
          user_id: this.config.userId,
          session_id: sessionId
        }
      });
      console.log('Session cleared successfully');
    } catch (error) {
      console.error('Error clearing Coze session:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw new Error('Failed to clear Coze session');
    }
  }
} 