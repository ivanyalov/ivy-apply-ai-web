import axios from 'axios';
import { authService } from './auth';

const API_URL = 'http://localhost:8000/api/subscriptions';

export interface SubscriptionStatus {
  hasAccess: boolean;
  type: 'trial' | 'premium' | null;
  expiresAt: Date | null;
}

class SubscriptionService {
  async startTrial(): Promise<{ message: string; expiresAt: Date }> {
    const response = await axios.post(
      `${API_URL}/start-trial`,
      {},
      { headers: authService.getAuthHeader() }
    );
    return response.data;
  }

  async getStatus(): Promise<SubscriptionStatus> {
    const response = await axios.get<SubscriptionStatus>(
      `${API_URL}/status`,
      { headers: authService.getAuthHeader() }
    );
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService(); 