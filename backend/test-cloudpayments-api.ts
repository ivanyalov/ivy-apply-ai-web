import { subscriptionService } from "./src/services/subscription.service";
import { pool } from "./src/config/database";

async function testCloudPaymentsAPI() {
	try {
		console.log("🧪 Тестируем CloudPayments API...\n");

		// Проверяем переменные окружения
		const publicId = process.env.CLOUD_PAYMENTS_PUBLIC_ID;
		const secretKey = process.env.CLOUD_PAYMENTS_SECRET_KEY;

		console.log("🔑 Проверяем переменные окружения:");
		console.log(`   - CLOUD_PAYMENTS_PUBLIC_ID: ${publicId ? "установлен" : "НЕ УСТАНОВЛЕН"}`);
		console.log(`   - CLOUD_PAYMENTS_SECRET_KEY: ${secretKey ? "установлен" : "НЕ УСТАНОВЛЕН"}\n`);

		if (!publicId || !secretKey) {
			console.log("❌ CloudPayments API ключи не настроены!");
			console.log("   Убедитесь, что в .env файле указаны:");
			console.log("   - CLOUD_PAYMENTS_PUBLIC_ID=ваш_public_id");
			console.log("   - CLOUD_PAYMENTS_SECRET_KEY=ваш_secret_key");
			return;
		}

		// Получаем пользователя с подпиской
		const usersResult = await pool.query(`
			SELECT 
				u.id, 
				u.email,
				s.id as subscription_id,
				s.status,
				s.plan_type,
				s.cloudpayments_subscription_id,
				s.cloudpayments_transaction_id,
				s.expires_at
			FROM users u
			LEFT JOIN subscriptions s ON u.id = s.user_id
			WHERE s.id IS NOT NULL
			ORDER BY s.created_at DESC
			LIMIT 1
		`);

		const userWithSubscription = usersResult.rows[0];

		if (!userWithSubscription) {
			console.log("❌ Нет пользователей с подпиской для тестирования");
			return;
		}

		console.log(`👤 Тестируем с пользователем: ${userWithSubscription.email}`);
		console.log(`📋 Подписка:`);
		console.log(`   - ID: ${userWithSubscription.subscription_id}`);
		console.log(`   - Статус: ${userWithSubscription.status}`);
		console.log(`   - Тип: ${userWithSubscription.plan_type}`);
		console.log(
			`   - CloudPayments Subscription ID: ${
				userWithSubscription.cloudpayments_subscription_id || "нет"
			}`
		);
		console.log(
			`   - CloudPayments Transaction ID: ${
				userWithSubscription.cloudpayments_transaction_id || "нет"
			}`
		);
		console.log(`   - Истекает: ${userWithSubscription.expires_at}\n`);

		// Тестируем getSubscriptionStatus
		console.log("🔄 Тестируем getSubscriptionStatus...");
		const subscriptionStatus = await subscriptionService.getSubscriptionStatus(
			userWithSubscription.id
		);

		console.log("✅ Результат getSubscriptionStatus:");
		console.log(JSON.stringify(subscriptionStatus, null, 2));

		// Если есть CloudPayments subscription ID, тестируем прямой API запрос
		if (userWithSubscription.cloudpayments_subscription_id) {
			console.log("\n🔄 Тестируем прямой запрос к CloudPayments API...");
			const cloudPaymentsResult = await subscriptionService.getCloudPaymentsSubscriptionStatus(
				userWithSubscription.cloudpayments_subscription_id
			);

			console.log("✅ Результат CloudPayments API:");
			console.log(JSON.stringify(cloudPaymentsResult, null, 2));
		}

		console.log("\n✅ Тестирование завершено!");
	} catch (error) {
		console.error("❌ Ошибка при тестировании:", error);
	} finally {
		await pool.end();
	}
}

// Запускаем тест
testCloudPaymentsAPI();
