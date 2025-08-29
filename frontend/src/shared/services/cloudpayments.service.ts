/**
 * CloudPayments Service
 * Сервис для работы с CloudPayments виджетом согласно официальной документации
 */

declare global {
	interface Window {
		cp: any;
	}
}

export interface PaymentOptions {
	publicId: string;
	description: string;
	amount: number;
	currency: string;
	accountId: string;
	invoiceId?: string;
	email?: string;
	skin?: string;
	data?: any;
}

export interface SubscriptionOptions extends PaymentOptions {
	interval: "Day" | "Week" | "Month";
	period: number;
	maxPeriods?: number;
	startDate?: string;
}

export interface PaymentResult {
	success: boolean;
	message?: string;
	error?: string;
	data?: any;
	token?: string; // Токен карты для создания подписки
}

export class CloudPaymentsService {
	private publicId: string;

	constructor() {
		this.publicId = import.meta.env.VITE_CLOUDPAYMENTS_PUBLIC_ID || "";
	}

	/**
	 * Создание ежемесячной подписки
	 * Двухэтапный процесс согласно документации CloudPayments:
	 * 1. Первый платеж через виджет → получаем токен карты
	 * 2. Создание подписки через API с токеном
	 */
	createMonthlySubscription(options: {
		amount: number;
		description: string;
		accountId: string;
		email?: string;
		invoiceId?: string;
	}): Promise<PaymentResult> {
		return new Promise((resolve) => {
			try {
				// Создаем виджет согласно документации
				const widget = new window.cp.CloudPayments();

				// Формируем чек для подписки
				const receipt = {
					Items: [
						{
							label: options.description,
							price: options.amount,
							quantity: 1.0,
							amount: options.amount,
							vat: 20,
							method: 0,
							object: 0,
						},
					],
					taxationSystem: 0,
					email: options.email,
					amounts: {
						electronic: options.amount,
						advancePayment: 0.0,
						credit: 0.0,
						provision: 0.0,
					},
				};

				// Данные для рекуррентных платежей
				const data = {
					CloudPayments: {
						CustomerReceipt: receipt, // чек для первого платежа
						recurrent: {
							interval: "Month",
							period: 1,
							customerReceipt: receipt, // чек для регулярных платежей
						},
					},
				};

				// Вызываем метод charge для создания подписки
				widget.charge(
					{
						publicId: this.publicId,
						description: options.description,
						amount: options.amount,
						currency: "RUB",
						invoiceId: options.invoiceId,
						accountId: options.accountId,
						email: options.email,
						skin: "modern",
						data: data,
					},
					// onSuccess callback
					(options: any) => {
						console.log("Payment successful, creating subscription:", options);

						// Если есть токен карты, создаем подписку через API
						if (options.token) {
							this.createSubscriptionViaAPI({
								token: options.token,
								accountId: options.accountId,
								description: options.description,
								amount: options.amount,
								email: options.email,
							}).then((apiResult) => {
								if (apiResult.success) {
									resolve({
										success: true,
										message: "Подписка успешно создана",
										data: apiResult.data,
										token: options.token,
									});
								} else {
									resolve({
										success: false,
										error: `Платеж прошел, но не удалось создать подписку: ${apiResult.error}`,
									});
								}
							});
						} else {
							// Fallback: подписка создается автоматически через виджет
							resolve({
								success: true,
								message: "Подписка создана автоматически",
								data: options,
							});
						}
					},
					// onFail callback
					(reason: any, options: any) => {
						console.error("Payment failed:", reason, options);
						resolve({
							success: false,
							error: reason,
						});
					}
				);
			} catch (error) {
				console.error("CloudPayments widget error:", error);
				resolve({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		});
	}

	/**
	 * Создание подписки через API CloudPayments
	 * Frontend вызывает /api/payments/cloudpayments/create-subscription, backend проксирует на CloudPayments
	 */
	private async createSubscriptionViaAPI(options: {
		token: string;
		accountId: string;
		description: string;
		amount: number;
		email?: string;
	}): Promise<PaymentResult> {
		try {
			const response = await fetch("/api/payments/cloudpayments/create-subscription", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token: options.token,
					accountId: options.accountId,
					description: options.description,
					amount: options.amount,
					currency: "RUB",
					interval: "Month",
					period: 1,
					email: options.email,
				}),
			});

			const result = await response.json();
			if (result.Success) {
				return {
					success: true,
					message: "Подписка создана через API",
					data: result.Model,
				};
			} else {
				return {
					success: false,
					error: result.Message || "Неизвестная ошибка API",
				};
			}
		} catch (error) {
			console.error("API subscription creation error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Network error",
			};
		}
	}

	/**
	 * Проверка доступности виджета
	 */
	isWidgetAvailable(): boolean {
		return typeof window !== "undefined" && !!window.cp;
	}

	/**
	 * Получение Public ID
	 */
	getPublicId(): string {
		return this.publicId;
	}

	/**
	 * Тестовый запрос к CloudPayments API через backend
	 * Frontend отправляет запрос на /api/payments/cloudpayments/test, backend проксирует на CloudPayments
	 * @returns {Promise<PaymentResult>} Результат тестового запроса
	 */
	async testConnection(): Promise<PaymentResult> {
		try {
			const response = await fetch("/api/payments/cloudpayments/test", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const result = await response.json();
			return {
				success: result.Success,
				message: result.Message,
				data: result,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Network error",
			};
		}
	}

	/**
	 * Отмена подписки через backend proxy
	 */
	async cancelSubscription(subscriptionId: string): Promise<PaymentResult> {
		try {
			const response = await fetch("/api/payments/cloudpayments/cancel-subscription", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ subscriptionId }),
			});
			const result = await response.json();
			return {
				success: result.Success,
				message: result.Message,
				data: result,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Network error",
			};
		}
	}

	/**
	 * Получение статуса подписки через backend proxy
	 */
	async getSubscriptionStatus(subscriptionId: string): Promise<PaymentResult> {
		try {
			const response = await fetch("/api/payments/cloudpayments/get-subscription", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ subscriptionId }),
			});
			const result = await response.json();
			return {
				success: result.Success,
				message: result.Message,
				data: result,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Network error",
			};
		}
	}
}

// Создаем экземпляр сервиса
export const cloudPaymentsService = new CloudPaymentsService();
