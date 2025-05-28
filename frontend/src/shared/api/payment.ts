import axios from 'axios';
import { authService } from './auth';

const API_URL = 'http://localhost:8000/api/payments';

export interface CreatePaymentResponse {
  redirectUrl: string;
}

export interface PaymentStatusResponse {
  status: 'pending' | 'succeeded' | 'canceled' | 'failed';
}

class PaymentService {
  async createPayment(amount: number, currency: string): Promise<CreatePaymentResponse> {
    const response = await axios.post<CreatePaymentResponse>(
      `${API_URL}/create`,
      { amount, currency },
      { headers: authService.getAuthHeader() }
    );
    return response.data;
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    const response = await axios.get<PaymentStatusResponse>(
      `${API_URL}/status/${paymentId}`,
      { headers: authService.getAuthHeader() }
    );
    return response.data;
  }
}

export const paymentService = new PaymentService(); 