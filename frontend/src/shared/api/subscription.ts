import axios from 'axios';
import { authService } from './auth';

const API_URL = 'http://localhost:8000/api/subscriptions';

/**
 * @interface SubscriptionStatus
 * @description Определяет статус подписки пользователя.
 * @property {boolean} hasAccess - Есть ли у пользователя доступ.
 * @property {'trial' | 'premium' | null} type - Тип плана подписки.
 * @property {'active' | 'cancelled' | 'unsubscribed'} status - Текущий статус подписки.
 * @property {Date | null} expiresAt - Дата окончания срока действия подписки.
 */
export interface SubscriptionStatus {
  hasAccess: boolean;
  type: 'trial' | 'premium' | null;
  status: 'active' | 'cancelled' | 'unsubscribed';
  expiresAt: Date | null;
}

/**
 * @class SubscriptionService
 * @description Сервис для управления подписками пользователя.
 */
class SubscriptionService {
  /**
   * @method startTrial
   * @description Начинает пробный период для пользователя.
   * @returns {Promise<{ message: string; expiresAt: Date }>} - Сообщение о результате и дата окончания.
   */
  async startTrial(): Promise<{ message: string; expiresAt: Date }> {
    const response = await axios.post(
      `${API_URL}/start-trial`,
      {},
      { headers: authService.getAuthHeader() }
    );
    return response.data;
  }

  /**
   * @method getStatus
   * @description Получает текущий статус подписки пользователя.
   * @returns {Promise<SubscriptionStatus>} - Статус подписки.
   */
  async getStatus(): Promise<SubscriptionStatus> {
    const response = await axios.get<SubscriptionStatus>(
      `${API_URL}/status`,
      { headers: authService.getAuthHeader() }
    );
    return response.data;
  }

  /**
   * @method cancel
   * @description Отменяет текущую подписку пользователя.
   * @returns {Promise<{ message: string }>} - Сообщение о результате.
   */
  async cancel(): Promise<{ message: string }> {
    const response = await axios.post(
      `${API_URL}/cancel`,
      {},
      { headers: authService.getAuthHeader() }
    );
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService(); 