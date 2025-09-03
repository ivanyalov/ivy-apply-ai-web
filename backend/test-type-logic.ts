import { pool } from "./src/config/database";
import { subscriptionService } from "./src/services/subscription.service";

async function testTypeLogic() {
	try {
		console.log("🧪 Тестируем логику type в getSubscriptionStatus...\n");

		// Получаем всех пользователей
		const usersResult = await pool.query("SELECT id, email FROM users LIMIT 3");
		const users = usersResult.rows;

		for (const user of users) {
			console.log(`\n👤 Пользователь: ${user.email} (ID: ${user.id})`);

			// Получаем статус подписки
			const subscriptionStatus = await subscriptionService.getSubscriptionStatus(user.id);

			console.log(`   Статус подписки:`);
			console.log(`     - hasAccess: ${subscriptionStatus.hasAccess}`);
			console.log(`     - type: ${subscriptionStatus.type || "null (нет активной подписки)"}`);
			console.log(`     - status: ${subscriptionStatus.status}`);
			console.log(`     - expiresAt: ${subscriptionStatus.expiresAt || "null"}`);
			console.log(`     - trialUsed: ${subscriptionStatus.trialUsed}`);

			// Проверяем логику
			if (subscriptionStatus.hasAccess) {
				console.log(`   ✅ Логика корректна: hasAccess=true, type=${subscriptionStatus.type}`);
			} else {
				if (subscriptionStatus.type === null) {
					console.log(`   ✅ Логика корректна: hasAccess=false, type=null`);
				} else {
					console.log(
						`   ❌ Логика некорректна: hasAccess=false, но type=${subscriptionStatus.type}`
					);
				}
			}
		}

		console.log("\n✅ Тестирование логики type завершено!");
	} catch (error) {
		console.error("❌ Ошибка при тестировании:", error);
	} finally {
		await pool.end();
	}
}

// Запускаем тест
testTypeLogic();
