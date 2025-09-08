import {
	createSubscription,
	getSubscriptionByUserId,
	updateSubscription,
	hasTrialAvailable,
} from "../models/Subscription";
import { AuthService } from "./authService";
import { UserModel } from "../models/User";
import axios from "axios";

export class SubscriptionService {
	async startTrial(userId: string) {
		const userModel = new UserModel();

		// Проверяем, использовал ли пользователь уже пробный период
		const user = await userModel.findById(userId);
		if (!user) {
			throw new Error("User not found.");
		}

		// Проверяем, доступен ли пробный период (не было активной подписки с expiresAt >= текущей даты)
		const trialAvailable = await hasTrialAvailable(userId);
		if (!trialAvailable) {
			throw new Error("User already has an active subscription or trial period.");
		}

		// Отмечаем, что пользователь использовал пробный период
		await userModel.markTrialUsed(userId);

		return await createSubscription({
			userId,
			status: "active",
			planType: "trial",
			startDate: new Date(),
			expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 дня
		});
	}

	async getSubscriptionStatus(userId: string) {
		const userModel = new UserModel();
		const user = await userModel.findById(userId);
		const subscription = await getSubscriptionByUserId(userId);

		if (
			!subscription ||
			subscription.status === "unsubscribed" ||
			subscription.status === "cancelled"
		) {
			return {
				hasAccess: false,
				type: null, // Нет активной подписки
				status: subscription?.status || "unsubscribed",
				expiresAt: subscription?.expiresAt || null,
				trialUsed: user?.trial_used || false,
			};
		}

		// Если у подписки есть cloudPaymentsSubscriptionId, проверяем статус подписки в CloudPayments
		if (subscription.cloudPaymentsSubscriptionId) {
			try {
				const cloudPaymentsResult = await this.getCloudPaymentsSubscriptionStatus(
					subscription.cloudPaymentsSubscriptionId
				);

				// Если статус в CloudPayments отличается от локального, обновляем
				if (cloudPaymentsResult.status && cloudPaymentsResult.status !== subscription.status) {
					if (subscription.id) {
						await updateSubscription(subscription.id, {
							status: cloudPaymentsResult.status as "active" | "cancelled" | "unsubscribed",
						});
						subscription.status = cloudPaymentsResult.status as
							| "active"
							| "cancelled"
							| "unsubscribed";
					}
				}
			} catch (error) {
				console.error("Failed to get CloudPayments subscription status:", error);
				// Продолжаем с локальным статусом в случае ошибки
			}
		}
		// Если нет subscriptionId, но есть transactionId, проверяем статус транзакции
		else if (subscription.cloudPaymentsTransactionId) {
			try {
				const cloudPaymentsStatus = await this.getCloudPaymentsTransactionStatus(
					subscription.cloudPaymentsTransactionId
				);

				// Если статус в CloudPayments отличается от локального, обновляем
				if (cloudPaymentsStatus && cloudPaymentsStatus !== subscription.status) {
					if (subscription.id) {
						await updateSubscription(subscription.id, {
							status: cloudPaymentsStatus as "active" | "cancelled" | "unsubscribed",
						});
						subscription.status = cloudPaymentsStatus as "active" | "cancelled" | "unsubscribed";
					}
				}
			} catch (error) {
				console.error("Failed to get CloudPayments transaction status:", error);
				// Продолжаем с локальным статусом в случае ошибки
			}
		}

		const now = new Date();
		if (subscription.expiresAt && subscription.expiresAt <= now) {
			// Subscription has expired, update status
			if (subscription.id) {
				await updateSubscription(subscription.id, { status: "unsubscribed" });
			}
			return {
				hasAccess: false,
				type: null, // Подписка истекла, нет активного типа
				status: "unsubscribed",
				expiresAt: subscription.expiresAt,
				trialUsed: user?.trial_used || false,
			};
		}

		const hasAccess = subscription.status === "active";

		return {
			hasAccess,
			type: hasAccess ? subscription.planType : null, // Только если подписка активна
			status: subscription.status,
			expiresAt: subscription.expiresAt,
			trialUsed: user?.trial_used || false,
			// Возвращаем CloudPayments ID только для активных подписок
			cloudPaymentsSubscriptionId: hasAccess ? subscription.cloudPaymentsSubscriptionId : null,
			lastChecked: new Date().toISOString(),
		};
	}

	async signupAndStartTrial(email: string, password: string) {
		const authService = new AuthService();
		const { user } = await authService.signup(email, password);
		const subscription = await this.startTrial(user.id);
		return { user, subscription };
	}

	/**
	 * Получает статус транзакции из CloudPayments
	 * @param transactionId - ID транзакции в CloudPayments
	 * @returns Promise<string | null> - Статус транзакции или null в случае ошибки
	 */
	private async getCloudPaymentsTransactionStatus(transactionId: string): Promise<string | null> {
		try {
			const publicId = process.env.CLOUD_PAYMENTS_PUBLIC_ID;
			const secretKey = process.env.CLOUD_PAYMENTS_SECRET_KEY;

			if (!publicId || !secretKey) {
				console.error("CloudPayments credentials not configured");
				return null;
			}

			const credentials = Buffer.from(`${publicId}:${secretKey}`).toString("base64");

			const response = await axios.post(
				"https://api.cloudpayments.ru/payments/get",
				{
					TransactionId: transactionId,
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Basic ${credentials}`,
					},
				}
			);

			const data = response.data;

			// Маппинг статусов CloudPayments на локальные статусы
			if (data.Success) {
				const status = data.Model?.Status;
				switch (status) {
					case "Completed":
						return "active";
					case "Failed":
					case "Cancelled":
						return "cancelled";
					case "Pending":
					case "Authorized":
						return "active"; // Временно считаем активной
					default:
						return "unsubscribed";
				}
			}

			return null;
		} catch (error) {
			console.error("Error getting CloudPayments transaction status:", error);
			return null;
		}
	}

	/**
	 * @method getCloudPaymentsSubscriptionStatus
	 * @description Запрашивает статус подписки в CloudPayments и возвращает локальный статус
	 * @param {string} subscriptionId - ID подписки в CloudPayments
	 * @returns {Promise<{status: string | null, nextPaymentDate?: string}>} Локальный статус подписки и дата следующего платежа
	 */
	async getCloudPaymentsSubscriptionStatus(
		subscriptionId: string
	): Promise<{ status: string | null; nextPaymentDate?: string }> {
		try {
			const response = await axios.post(
				"https://api.cloudpayments.ru/subscriptions/get",
				{ Id: subscriptionId },
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Basic ${Buffer.from(
							`${process.env.CLOUD_PAYMENTS_PUBLIC_ID}:${process.env.CLOUD_PAYMENTS_SECRET_KEY}`
						).toString("base64")}`,
					},
				}
			);

			const data = response.data;

			// Маппинг статусов CloudPayments на локальные статусы
			if (data.Success && data.Model) {
				const status = data.Model.Status;
				const nextPaymentDate = data.Model.NextTransactionDateIso;

				switch (status) {
					case "Active":
						return { status: "active", nextPaymentDate };
					case "Cancelled":
					case "PastDue":
					case "Rejected":
						return { status: "cancelled", nextPaymentDate };
					case "Expired":
						return { status: "unsubscribed", nextPaymentDate };
					default:
						return { status: "unsubscribed", nextPaymentDate };
				}
			}

			return { status: null };
		} catch (error) {
			console.error("Error getting CloudPayments subscription status:", error);
			return { status: null };
		}
	}
}

export const subscriptionService = new SubscriptionService();
