// @ts-nocheck
import { Router } from "express";
import {
	getSubscriptionByUserId,
	updateSubscription,
	createSubscription,
} from "../models/Subscription";
import { createPayment } from "../models/Payment";
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
			Email,
		} = req.body;

		console.log("CloudPayments notification received:", {
			InvoiceId,
			AccountId,
			Amount,
			Currency,
			Status,
			SubscriptionId,
			Email,
		});

		// Здесь можно добавить проверку подписи уведомления для безопасности
		// const signature = req.headers['x-signature'];
		// if (!verifySignature(req.body, signature)) {
		//   return res.status(400).json({ code: 1, message: 'Invalid signature' });
		// }

		if (Status === "Completed") {
			const userId = String(AccountId);

			// Проверяем, есть ли уже подписка у пользователя
			let subscription = await getSubscriptionByUserId(userId);

			if (subscription && subscription.id) {
				// Обновляем существующую подписку
				await updateSubscription(subscription.id, {
					planType: "premium",
					status: "active",
					cloudPaymentsSubscriptionId: SubscriptionId,
					cloudPaymentsToken: Token,
					expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
				});
			} else {
				// Создаем новую подписку
				subscription = await createSubscription({
					userId,
					planType: "premium",
					status: "active",
					cloudPaymentsSubscriptionId: SubscriptionId,
					cloudPaymentsToken: Token,
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

export default router;
