// @ts-nocheck
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
	getSubscriptionByUserId,
	updateSubscription,
	createSubscription,
} from "../models/Subscription";
import { createPayment } from "../models/Payment";
import { pool } from "../config/database";
import axios from "axios";

const router = Router();

// CloudPayments webhook для платежей (Pay notification)
router.post("/cloudpayments/notify", async (req, res) => {
	try {
		const {
			InvoiceId,
			AccountId,
			Amount,
			Currency,
			Status,
			SubscriptionId, // ID подписки CloudPayments
			Token, // Токен карты для подписки
			TransactionId, // ID транзакции CloudPayments
			Email,
		} = req.body;

		console.log("CloudPayments notification received:", {
			InvoiceId,
			AccountId,
			Amount,
			Currency,
			Status,
			SubscriptionId,
			TransactionId,
			Email,
		});

		// Здесь можно добавить проверку подписи уведомления для безопасности
		// const signature = req.headers['x-signature'];
		// if (!verifySignature(req.body, signature)) {
		//   return res.status(400).json({ code: 1, message: 'Invalid signature' });
		// }

		if (Status === "Completed") {
			const userId = String(AccountId);

			// Создаем рекуррентную подписку в CloudPayments если есть токен
			let cloudPaymentsSubscriptionId = SubscriptionId;
			if (Token) {
				try {
					console.log("🔄 Создаем рекуррентную подписку в CloudPayments...");

					const cloudPaymentsResponse = await axios.post(
						"https://api.cloudpayments.ru/subscriptions/create",
						{
							token: Token,
							accountId: userId,
							description: "Ежемесячная подписка на Ivy Apply AI",
							email: Email,
							amount: Amount,
							currency: Currency,
							requireConfirmation: false,
							startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Завтра
							interval: "Month",
							period: 1,
							CustomerReceipt: {
								Items: [
									{
										label: "Подписка Ivy Apply AI - ежемесячный доступ",
										price: Amount,
										quantity: 1.0,
										amount: Amount,
										vat: 20,
										method: 0,
										object: 0,
									},
								],
								taxationSystem: 0,
								email: Email,
								phone: "",
								isBso: false,
								amounts: {
									electronic: Amount,
									advancePayment: 0.0,
									credit: 0.0,
									provision: 0.0,
								},
							},
						},
						{
							headers: {
								"Content-Type": "application/json",
								Authorization: `Basic ${Buffer.from(
									`${process.env.CLOUD_PAYMENTS_PUBLIC_ID}:${process.env.CLOUD_PAYMENTS_SECRET_KEY}`
								).toString("base64")}`,
							},
						}
					);

					if (cloudPaymentsResponse.data.Success && cloudPaymentsResponse.data.Model?.Id) {
						cloudPaymentsSubscriptionId = cloudPaymentsResponse.data.Model.Id;
						console.log(
							`✅ CloudPayments рекуррентная подписка создана: ${cloudPaymentsSubscriptionId}`
						);
					} else {
						console.warn(
							"⚠️ Не удалось создать подписку в CloudPayments:",
							cloudPaymentsResponse.data
						);
					}
				} catch (error) {
					console.error("❌ Ошибка создания подписки в CloudPayments:", error);
					// Продолжаем с существующим SubscriptionId
				}
			}

			// Проверяем, есть ли уже подписка у пользователя
			let subscription = await getSubscriptionByUserId(userId);

			if (subscription && subscription.id) {
				// Обновляем существующую подписку
				await updateSubscription(subscription.id, {
					planType: "premium",
					status: "active",
					cloudPaymentsSubscriptionId: cloudPaymentsSubscriptionId,
					cloudPaymentsToken: Token,
					cloudPaymentsTransactionId: TransactionId,
					expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
				});
			} else {
				// Создаем новую подписку
				subscription = await createSubscription({
					userId,
					planType: "premium",
					status: "active",
					cloudPaymentsSubscriptionId: cloudPaymentsSubscriptionId,
					cloudPaymentsToken: Token,
					cloudPaymentsTransactionId: TransactionId,
					startDate: new Date(),
					expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
				});
			}

			// Создаем запись о платеже
			await createPayment({
				userId,
				subscriptionId: subscription.id,
				cloudPaymentsInvoiceId: String(InvoiceId),
				cloudPaymentsSubscriptionId: SubscriptionId,
				amount: Number(Amount),
				currency: String(Currency),
				status: "succeeded",
			});

			console.log(
				`Payment processed successfully for user ${userId}, subscription ${subscription.id}`
			);
		} else if (Status === "Failed") {
			// Обработка неуспешного платежа
			const userId = String(AccountId);

			await createPayment({
				userId,
				cloudPaymentsInvoiceId: String(InvoiceId),
				cloudPaymentsSubscriptionId: SubscriptionId,
				amount: Number(Amount),
				currency: String(Currency),
				status: "failed",
			});

			console.log(`Payment failed for user ${userId}, invoice ${InvoiceId}`);
		}

		// CloudPayments требует ответ {code: 0} для подтверждения получения
		res.json({ code: 0 });
	} catch (error) {
		console.error("CloudPayments notify error:", error);
		// Возвращаем ненулевой код для указания ошибки CloudPayments
		res.status(500).json({ code: 13, message: "Internal error" });
	}
});

// Создание подписки через API CloudPayments
// Прокси endpoint для безопасного вызова API CloudPayments
router.post("/cloudpayments/create-subscription", async (req, res) => {
	try {
		const { token, accountId, description, amount, currency, interval, period, email } = req.body;

		console.log("Creating subscription via CloudPayments API:", {
			accountId,
			description,
			amount,
			interval,
			period,
		});

		// Вызываем API CloudPayments для создания подписки
		const response = await axios.post(
			"https://api.cloudpayments.ru/subscriptions/create",
			{
				token,
				accountId,
				description,
				email,
				amount,
				currency,
				requireConfirmation: false,
				startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Завтра
				interval,
				period,
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${Buffer.from(
						`${process.env.CLOUD_PAYMENTS_PUBLIC_ID}:${process.env.CLOUD_PAYMENTS_SECRET_KEY}`
					).toString("base64")}`,
				},
			}
		);

		console.log("CloudPayments API response:", response.data);

		// Если успешно создана подписка, сохраняем transactionId в базе
		if (response.data.Success && response.data.Model?.Id) {
			// Здесь можно добавить логику для сохранения transactionId
			// если он передается в ответе API
			console.log("Subscription created successfully:", response.data.Model);
		}

		// Возвращаем ответ от CloudPayments API
		res.json(response.data);
	} catch (error) {
		console.error("CloudPayments API error:", error.response?.data || error.message);

		if (error.response?.data) {
			res.status(400).json(error.response.data);
		} else {
			res.status(500).json({
				Success: false,
				Message: "Internal server error",
			});
		}
	}
});

// CloudPayments webhook для отмены подписки
router.post("/cloudpayments/subscription-cancelled", async (req, res) => {
	try {
		const { SubscriptionId, AccountId } = req.body;

		console.log("CloudPayments subscription cancelled:", {
			SubscriptionId,
			AccountId,
		});

		const userId = String(AccountId);
		const subscription = await getSubscriptionByUserId(userId);

		if (subscription && subscription.cloudPaymentsSubscriptionId === SubscriptionId) {
			await updateSubscription(subscription.id, {
				status: "cancelled",
				cancelledAt: new Date(),
			});

			console.log(`Subscription ${subscription.id} cancelled for user ${userId}`);
		}

		res.json({ code: 0 });
	} catch (error) {
		console.error("CloudPayments subscription cancellation error:", error);
		res.status(500).json({ code: 13, message: "Internal error" });
	}
});

// Тестовый endpoint для проверки интеграции CloudPayments (см. cloudpayments-instructions.txt, раздел "Тестовый метод")
router.post("/cloudpayments/test", async (req, res) => {
	try {
		const publicId = process.env.CLOUD_PAYMENTS_PUBLIC_ID;
		const secretKey = process.env.CLOUD_PAYMENTS_SECRET_KEY;
		const credentials = Buffer.from(`${publicId}:${secretKey}`).toString("base64");

		const response = await axios.post(
			"https://api.cloudpayments.ru/test",
			{},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${credentials}`,
				},
			}
		);
		res.json(response.data);
	} catch (error) {
		console.error("CloudPayments test error:", error.response?.data || error.message);
		if (error.response?.data) {
			res.status(400).json(error.response.data);
		} else {
			res.status(500).json({
				Success: false,
				Message: "Internal server error",
			});
		}
	}
});

// CloudPayments: отмена подписки через API CloudPayments
router.post("/cloudpayments/cancel-subscription", async (req, res) => {
	try {
		const { subscriptionId } = req.body;
		const publicId = process.env.CLOUD_PAYMENTS_PUBLIC_ID;
		const secretKey = process.env.CLOUD_PAYMENTS_SECRET_KEY;
		const credentials = Buffer.from(`${publicId}:${secretKey}`).toString("base64");

		const response = await axios.post(
			"https://api.cloudpayments.ru/subscriptions/cancel",
			{
				Id: subscriptionId,
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${credentials}`,
				},
			}
		);
		res.json(response.data);
	} catch (error) {
		console.error(
			"CloudPayments cancel subscription error:",
			error.response?.data || error.message
		);
		if (error.response?.data) {
			res.status(400).json(error.response.data);
		} else {
			res.status(500).json({
				Success: false,
				Message: "Internal server error",
			});
		}
	}
});

// CloudPayments: получение статуса подписки через API CloudPayments
router.post("/cloudpayments/get-subscription", async (req, res) => {
	try {
		const { subscriptionId } = req.body;
		const publicId = process.env.CLOUD_PAYMENTS_PUBLIC_ID;
		const secretKey = process.env.CLOUD_PAYMENTS_SECRET_KEY;
		const credentials = Buffer.from(`${publicId}:${secretKey}`).toString("base64");

		const response = await axios.post(
			"https://api.cloudpayments.ru/subscriptions/get",
			{
				Id: subscriptionId,
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${credentials}`,
				},
			}
		);
		res.json(response.data);
	} catch (error) {
		console.error("CloudPayments get subscription error:", error.response?.data || error.message);
		if (error.response?.data) {
			res.status(400).json(error.response.data);
		} else {
			res.status(500).json({
				Success: false,
				Message: "Internal server error",
			});
		}
	}
});

// CloudPayments: получение статуса транзакции через API CloudPayments
router.post("/cloudpayments/get-transaction", async (req, res) => {
	try {
		const { transactionId } = req.body;
		const publicId = process.env.CLOUD_PAYMENTS_PUBLIC_ID;
		const secretKey = process.env.CLOUD_PAYMENTS_SECRET_KEY;
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
		res.json(response.data);
	} catch (error) {
		console.error("CloudPayments get transaction error:", error.response?.data || error.message);
		if (error.response?.data) {
			res.status(400).json(error.response.data);
		} else {
			res.status(500).json({
				Success: false,
				Message: "Internal server error",
			});
		}
	}
});

// Обработка ответа от CloudPayments API после успешной оплаты
router.post("/cloudpayments/payment-success", authMiddleware, async (req, res) => {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "User not authenticated",
			});
		}

		const { transactionId, subscriptionId, amount, currency, status, token } = req.body;

		console.log("CloudPayments payment success received:", {
			transactionId,
			subscriptionId,
			userId,
			amount,
			currency,
			status,
		});

		if (!transactionId) {
			return res.status(400).json({
				success: false,
				message: "TransactionId is required",
			});
		}

		if (status === "Completed" && transactionId) {
			console.log("🔄 Получаем детали транзакции и создаем подписку...");

			// 1. Получаем детали транзакции для извлечения токена
			let transactionToken = null;
			try {
				const transactionDetailsResponse = await axios.post(
					"https://api.cloudpayments.ru/payments/get",
					{ TransactionId: transactionId },
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Basic ${Buffer.from(
								`${process.env.CLOUD_PAYMENTS_PUBLIC_ID}:${process.env.CLOUD_PAYMENTS_SECRET_KEY}`
							).toString("base64")}`,
						},
					}
				);

				if (transactionDetailsResponse.data.Success) {
					transactionToken = transactionDetailsResponse.data.Model?.Token;
					console.log(`✅ Токен получен: ${transactionToken ? "да" : "нет"}`);
				}
			} catch (error) {
				console.error("❌ Ошибка получения деталей транзакции:", error);
			}

			// 2. Создаем подписку в CloudPayments если есть токен
			let cloudPaymentsSubscriptionId = null;
			if (transactionToken) {
				try {
					const user = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
					const userEmail = user.rows[0]?.email;

					const subscriptionResponse = await axios.post(
						"https://api.cloudpayments.ru/subscriptions/create",
						{
							token: transactionToken,
							accountId: userId,
							description: "Ежемесячная подписка на Ivy Apply AI",
							email: userEmail,
							amount: Number(amount),
							currency: String(currency),
							requireConfirmation: false,
							startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Завтра
							interval: "Month",
							period: 1,
						},
						{
							headers: {
								"Content-Type": "application/json",
								Authorization: `Basic ${Buffer.from(
									`${process.env.CLOUD_PAYMENTS_PUBLIC_ID}:${process.env.CLOUD_PAYMENTS_SECRET_KEY}`
								).toString("base64")}`,
							},
						}
					);

					if (subscriptionResponse.data.Success && subscriptionResponse.data.Model?.Id) {
						cloudPaymentsSubscriptionId = subscriptionResponse.data.Model.Id;
						console.log(`✅ CloudPayments подписка создана: ${cloudPaymentsSubscriptionId}`);
					} else {
						console.warn(
							"⚠️ Не удалось создать подписку в CloudPayments:",
							subscriptionResponse.data
						);
					}
				} catch (error) {
					console.error("❌ Ошибка создания подписки в CloudPayments:", error);
				}
			}

			// 3. Сохраняем подписку в нашу базу данных
			let subscription = await getSubscriptionByUserId(userId);
			const currentDate = new Date();

			if (subscription && subscription.id) {
				// Если есть активная подписка (включая пробную), завершаем её
				if (
					subscription.status === "active" &&
					subscription.expiresAt &&
					subscription.expiresAt > currentDate
				) {
					await updateSubscription(subscription.id, {
						status: "cancelled",
						expiresAt: currentDate,
						cancelledAt: currentDate,
					});
					console.log(`Previous subscription ${subscription.id} cancelled for user ${userId}`);
				}

				// Обновляем существующую подписку на premium
				await updateSubscription(subscription.id, {
					planType: "premium",
					status: "active",
					cloudPaymentsSubscriptionId: cloudPaymentsSubscriptionId,
					cloudPaymentsToken: transactionToken,
					cloudPaymentsTransactionId: transactionId,
					expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
				});
			} else {
				// Создаем новую подписку
				subscription = await createSubscription({
					userId,
					planType: "premium",
					status: "active",
					cloudPaymentsSubscriptionId: cloudPaymentsSubscriptionId,
					cloudPaymentsToken: transactionToken,
					cloudPaymentsTransactionId: transactionId,
					startDate: currentDate,
					expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
				});
			}

			// Создаем запись о платеже
			await createPayment({
				userId,
				subscriptionId: subscription.id,
				cloudPaymentsInvoiceId: String(transactionId), // Используем transactionId как invoiceId
				cloudPaymentsSubscriptionId: subscriptionId,
				amount: Number(amount),
				currency: String(currency),
				status: "succeeded",
			});

			console.log(
				`Payment success processed for user ${userId}, subscription ${subscription.id}, transaction ${transactionId}`
			);

			res.json({
				success: true,
				message: "Payment processed successfully",
				subscriptionId: subscription.id,
				transactionId: transactionId,
			});
		} else {
			res.status(400).json({
				success: false,
				message: "Invalid payment status or missing transactionId",
			});
		}
	} catch (error) {
		console.error("CloudPayments payment success error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
});

// Отмена подписки через CloudPayments API
router.post("/cloudpayments/cancel-subscription", authMiddleware, async (req, res) => {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "User not authenticated",
			});
		}

		// Получаем подписку пользователя
		const subscription = await getSubscriptionByUserId(userId);
		if (!subscription || !subscription.cloudPaymentsSubscriptionId) {
			return res.status(400).json({
				success: false,
				message: "No active subscription found",
			});
		}

		// Отменяем подписку в CloudPayments
		try {
			const cloudPaymentsResponse = await axios.post(
				"https://api.cloudpayments.ru/subscriptions/cancel",
				{
					Id: subscription.cloudPaymentsSubscriptionId,
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Basic ${Buffer.from(
							`${process.env.CLOUD_PAYMENTS_PUBLIC_ID}:${process.env.CLOUD_PAYMENTS_SECRET_KEY}`
						).toString("base64")}`,
					},
				}
			);

			if (cloudPaymentsResponse.data.Success) {
				// Обновляем статус подписки в базе данных
				await updateSubscription(subscription.id!, {
					status: "cancelled",
					cancelledAt: new Date(),
				});

				console.log(
					`✅ Subscription ${subscription.cloudPaymentsSubscriptionId} cancelled in CloudPayments for user ${userId}`
				);

				res.json({
					success: true,
					message: "Subscription cancelled successfully",
					subscriptionId: subscription.id,
				});
			} else {
				console.error(
					"❌ Failed to cancel subscription in CloudPayments:",
					cloudPaymentsResponse.data
				);
				res.status(400).json({
					success: false,
					message: "Failed to cancel subscription in CloudPayments",
				});
			}
		} catch (error) {
			console.error("❌ Error cancelling subscription in CloudPayments:", error);
			res.status(500).json({
				success: false,
				message: "Error cancelling subscription in CloudPayments",
			});
		}
	} catch (error) {
		console.error("CloudPayments cancel subscription error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
});

export default router;
