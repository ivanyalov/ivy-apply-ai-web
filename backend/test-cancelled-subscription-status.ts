import { subscriptionService } from "./src/services/subscription.service";
import { pool } from "./src/config/database";

async function testCancelledSubscriptionStatus() {
	try {
		console.log("🧪 Тестируем статус отмененной подписки...\n");

		// Находим пользователя с отмененной подпиской
		const usersResult = await pool.query(`
			SELECT 
				u.id, 
				u.email,
				u.trial_used,
				s.status,
				s.plan_type,
				s.cloudpayments_subscription_id
			FROM users u
			LEFT JOIN subscriptions s ON u.id = s.user_id
			WHERE s.status = 'cancelled'
			ORDER BY s.updated_at DESC
			LIMIT 1
		`);

		const cancelledUser = usersResult.rows[0];

		if (!cancelledUser) {
			console.log("❌ Нет пользователей с отмененными подписками для тестирования");

			// Покажем всех пользователей с подписками
			const allUsersResult = await pool.query(`
				SELECT 
					u.email,
					s.status,
					s.plan_type,
					s.cloudpayments_subscription_id
				FROM users u
				LEFT JOIN subscriptions s ON u.id = s.user_id
				WHERE s.id IS NOT NULL
				ORDER BY s.updated_at DESC
				LIMIT 5
			`);

			console.log("\n📋 Все пользователи с подписками:");
			allUsersResult.rows.forEach((user, index) => {
				console.log(`${index + 1}. ${user.email}: ${user.status} (${user.plan_type})`);
			});

			return;
		}

		console.log(`👤 Тестируем с пользователем: ${cancelledUser.email}`);
		console.log(`📋 Подписка в БД:`);
		console.log(`   - Status: ${cancelledUser.status}`);
		console.log(`   - Plan Type: ${cancelledUser.plan_type}`);
		console.log(`   - CloudPayments ID: ${cancelledUser.cloudpayments_subscription_id || "нет"}`);
		console.log(`   - Trial Used: ${cancelledUser.trial_used}`);

		// Тестируем getSubscriptionStatus
		console.log("\n🔄 Тестируем getSubscriptionStatus...");
		const subscriptionStatus = await subscriptionService.getSubscriptionStatus(cancelledUser.id);

		console.log("✅ Результат getSubscriptionStatus:");
		console.log(JSON.stringify(subscriptionStatus, null, 2));

		// Проверяем что CloudPayments ID НЕ возвращается для неактивных подписок
		console.log(`\n🔍 Детальная проверка cloudPaymentsSubscriptionId:`);
		console.log(`   - Значение: ${subscriptionStatus.cloudPaymentsSubscriptionId}`);
		console.log(`   - Тип: ${typeof subscriptionStatus.cloudPaymentsSubscriptionId}`);
		console.log(`   - === null: ${subscriptionStatus.cloudPaymentsSubscriptionId === null}`);
		console.log(
			`   - === undefined: ${subscriptionStatus.cloudPaymentsSubscriptionId === undefined}`
		);

		if (
			subscriptionStatus.cloudPaymentsSubscriptionId === null ||
			subscriptionStatus.cloudPaymentsSubscriptionId === undefined
		) {
			console.log("\n✅ ПРАВИЛЬНО: CloudPayments ID не возвращается для неактивных подписок");
		} else {
			console.log("\n❌ ОШИБКА: CloudPayments ID возвращается для неактивной подписки");
		}

		// Проверяем остальные поля
		console.log(`\n📊 Проверка полей:`);
		console.log(`   - hasAccess: ${subscriptionStatus.hasAccess} (должно быть false)`);
		console.log(`   - type: ${subscriptionStatus.type} (должно быть null)`);
		console.log(`   - status: ${subscriptionStatus.status} (должно быть cancelled)`);
		console.log(
			`   - cloudPaymentsSubscriptionId: ${subscriptionStatus.cloudPaymentsSubscriptionId} (должно быть null)`
		);

		console.log("\n✅ Тестирование завершено!");
	} catch (error) {
		console.error("❌ Ошибка при тестировании:", error);
	} finally {
		await pool.end();
	}
}

// Запускаем тест
testCancelledSubscriptionStatus();
