import axios from "axios";
import { authService } from "./auth";

const API_URL = "/api/payments";

/**
 * @interface CloudPaymentsResponse
 * @description Ответ от CloudPayments после успешного платежа
 */
export interface CloudPaymentsResponse {
	transactionId: string;
	subscriptionId?: string;
	status: string;
	amount: number;
	currency: string;
	token?: string;
}

/**
 * @interface PaymentSuccessRequest
 * @description Данные для отправки на бэкэнд при успешном платеже
 */
export interface PaymentSuccessRequest {
	transactionId: string;
	subscriptionId?: string;
	accountId: string;
	amount: number;
	currency: string;
	status: string;
	token?: string;
}

/**
 * @interface PaymentSuccessResponse
 * @description Ответ от бэкэнда при успешном сохранении платежа
 */
export interface PaymentSuccessResponse {
	success: boolean;
	message: string;
	subscriptionId: string;
	transactionId: string;
}

/**
 * @class PaymentService
 * @description Сервис для управления платежами CloudPayments
 */
class PaymentService {
	/**
	 * @method processPaymentSuccess
	 * @description Отправляет данные об успешном платеже на бэкэнд
	 * @param {PaymentSuccessRequest} paymentData - Данные платежа
	 * @returns {Promise<PaymentSuccessResponse>} Ответ от бэкэнда
	 */
	async processPaymentSuccess(paymentData: PaymentSuccessRequest): Promise<PaymentSuccessResponse> {
		const response = await axios.post<PaymentSuccessResponse>(
			`${API_URL}/cloudpayments/payment-success`,
			paymentData,
			{ headers: authService.getAuthHeader() }
		);
		return response.data;
	}

	/**
	 * @method cancelSubscription
	 * @description Отменяет подписку пользователя через CloudPayments
	 * @returns {Promise<{ success: boolean; message: string; subscriptionId: string }>} Ответ от бэкэнда
	 */
	async cancelSubscription(): Promise<{
		success: boolean;
		message: string;
		subscriptionId: string;
	}> {
		const response = await axios.post(
			`${API_URL}/cloudpayments/cancel-subscription`,
			{},
			{ headers: authService.getAuthHeader() }
		);
		return response.data;
	}
}

export const paymentService = new PaymentService();
