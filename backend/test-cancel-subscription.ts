import { pool } from "./src/config/database";
import { getSubscriptionByUserId } from "./src/models/Subscription";

async function testCancelSubscription() {
	try {
		console.log("🧪 Тестируем логику отмены подписки...\n");

		// Получаем пользователя с активной подпиской
		const usersResult = await pool.query(`
			SELECT 
				u.id, 
				u.email,
				s.id as subscription_id,
				s.status,
				s.plan_type,
				s.cloudpayments_subscription_id,
				s.cloudpayments_token,
				s.expires_at
			FROM users u
			LEFT JOIN subscriptions s ON u.id = s.user_id
			WHERE s.status = 'active' AND s.plan_type = 'premium'
			LIMIT 1
		`);

		const userWithSubscription = usersResult.rows[0];

		if (!userWithSubscription) {
			console.log("❌ Нет пользователей с активной premium подпиской для тестирования");

			// Показываем всех пользователей с подписками
			const allSubscriptionsResult = await pool.query(`
				SELECT 
					u.email,
					s.status,
					s.plan_type,
					s.cloudpayments_subscription_id,
					s.expires_at
				FROM users u
				LEFT JOIN subscriptions s ON u.id = s.user_id
				WHERE s.id IS NOT NULL
				ORDER BY s.created_at DESC
				LIMIT 5
			`);

			console.log("\n📋 Все подписки в системе:");
			allSubscriptionsResult.rows.forEach((sub, index) => {
				console.log(
					`${index + 1}. ${sub.email}: ${sub.status} (${sub.plan_type}) - ${
						sub.cloudpayments_subscription_id || "нет ID"
					}`
				);
			});

			return;
		}

		console.log(`👤 Тестируем с пользователем: ${userWithSubscription.email}`);
		console.log(`📋 Подписка:`);
		console.log(`   - ID: ${userWithSubscription.subscription_id}`);
		console.log(`   - Статус: ${userWithSubscription.status}`);
		console.log(`   - Тип: ${userWithSubscription.plan_type}`);
		console.log(
			`   - CloudPayments ID: ${userWithSubscription.cloudpayments_subscription_id || "нет"}`
		);
		console.log(`   - Токен: ${userWithSubscription.cloudpayments_token ? "есть" : "нет"}`);
		console.log(`   - Истекает: ${userWithSubscription.expires_at}`);

		// Проверяем, есть ли CloudPayments ID для отмены
		if (!userWithSubscription.cloudpayments_subscription_id) {
			console.log("\n⚠️  ВНИМАНИЕ: У подписки нет cloudpayments_subscription_id!");
			console.log("   Это означает, что подписка НЕ была создана в CloudPayments.");
			console.log("   Для отмены нужно сначала создать подписку через CloudPayments API.");
		} else {
			console.log("\n✅ Подписка готова для отмены через CloudPayments API");
			console.log(`   Endpoint: POST /api/payments/cloudpayments/cancel-subscription`);
			console.log(`   CloudPayments ID: ${userWithSubscription.cloudpayments_subscription_id}`);
		}

		console.log("\n✅ Тестирование завершено!");
	} catch (error) {
		console.error("❌ Ошибка при тестировании:", error);
	} finally {
		await pool.end();
	}
}

// Запускаем тест
testCancelSubscription();
