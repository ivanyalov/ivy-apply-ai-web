import { pool } from "./src/config/database";
import axios from "axios";

async function createSubscriptionFromTransaction() {
	try {
		console.log("🧪 Тестируем создание подписки из существующей транзакции...\n");

		// Находим последнюю транзакцию без подписки
		const transactionResult = await pool.query(`
			SELECT 
				u.id as user_id,
				u.email,
				s.id as subscription_id,
				s.cloudpayments_transaction_id,
				s.cloudpayments_subscription_id
			FROM users u
			LEFT JOIN subscriptions s ON u.id = s.user_id
			WHERE s.cloudpayments_transaction_id IS NOT NULL 
			AND s.cloudpayments_subscription_id IS NULL
			ORDER BY s.created_at DESC
			LIMIT 1
		`);

		const transaction = transactionResult.rows[0];

		if (!transaction) {
			console.log("❌ Нет транзакций без подписки для тестирования");
			return;
		}

		console.log(`👤 Работаем с пользователем: ${transaction.email}`);
		console.log(`💳 TransactionId: ${transaction.cloudpayments_transaction_id}`);

		// Получаем детали транзакции из CloudPayments
		console.log("\n🔄 Получаем детали транзакции из CloudPayments...");

		const transactionDetailsResponse = await axios.post(
			"https://api.cloudpayments.ru/payments/get",
			{ TransactionId: transaction.cloudpayments_transaction_id },
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${Buffer.from(
						`${process.env.CLOUD_PAYMENTS_PUBLIC_ID}:${process.env.CLOUD_PAYMENTS_SECRET_KEY}`
					).toString("base64")}`,
				},
			}
		);

		if (!transactionDetailsResponse.data.Success) {
			console.log("❌ Не удалось получить детали транзакции");
			console.log(transactionDetailsResponse.data);
			return;
		}

		const transactionDetails = transactionDetailsResponse.data.Model;
		console.log("✅ Детали транзакции получены:");
		console.log(`   - Status: ${transactionDetails.Status}`);
		console.log(`   - Token: ${transactionDetails.Token ? "есть" : "нет"}`);
		console.log(`   - Amount: ${transactionDetails.Amount}`);

		if (!transactionDetails.Token) {
			console.log("❌ У транзакции нет Token для создания подписки");
			console.log("   Убедитесь, что платеж был сделан с параметром recurrent: true");
			return;
		}

		// Создаем подписку через CloudPayments API
		console.log("\n🔄 Создаем подписку через CloudPayments API...");

		const subscriptionResponse = await axios.post(
			"https://api.cloudpayments.ru/subscriptions/create",
			{
				token: transactionDetails.Token,
				accountId: transaction.user_id,
				description: "Ежемесячная подписка на Ivy Apply AI",
				email: transaction.email,
				amount: 990,
				currency: "RUB",
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

		if (!subscriptionResponse.data.Success) {
			console.log("❌ Не удалось создать подписку:");
			console.log(subscriptionResponse.data);
			return;
		}

		const subscriptionData = subscriptionResponse.data.Model;
		console.log("✅ Подписка создана в CloudPayments:");
		console.log(`   - ID: ${subscriptionData.Id}`);
		console.log(`   - Status: ${subscriptionData.Status}`);
		console.log(`   - Next Payment: ${subscriptionData.NextTransactionDateIso}`);

		// Обновляем подписку в нашей базе данных
		console.log("\n🔄 Обновляем подписку в базе данных...");

		await pool.query(
			`UPDATE subscriptions 
			 SET cloudpayments_subscription_id = $1 
			 WHERE id = $2`,
			[subscriptionData.Id, transaction.subscription_id]
		);

		console.log("✅ Подписка обновлена в базе данных!");
		console.log("\n🎉 Тестирование завершено успешно!");
	} catch (error: any) {
		console.error("❌ Ошибка при тестировании:", error);
		if (error.response?.data) {
			console.error("CloudPayments API error:", error.response.data);
		}
	} finally {
		await pool.end();
	}
}

// Запускаем тест
createSubscriptionFromTransaction();
