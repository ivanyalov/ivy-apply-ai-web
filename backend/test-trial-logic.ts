import { pool } from "./src/config/database";
import { getSubscriptionByUserId, hasTrialAvailable } from "./src/models/Subscription";

async function testTrialLogic() {
	try {
		console.log("🧪 Тестируем логику завершения пробного периода...\n");

		// Тест 1: Проверяем функцию hasTrialAvailable
		console.log("1️⃣ Тестируем hasTrialAvailable:");

		// Получаем всех пользователей
		const usersResult = await pool.query("SELECT id, email FROM users LIMIT 3");
		const users = usersResult.rows;

		for (const user of users) {
			console.log(`\n👤 Пользователь: ${user.email} (ID: ${user.id})`);

			// Проверяем доступность пробного периода
			const trialAvailable = await hasTrialAvailable(user.id);
			console.log(`   Пробный период доступен: ${trialAvailable}`);

			// Получаем текущую подписку
			const subscription = await getSubscriptionByUserId(user.id);
			if (subscription) {
				console.log(`   Текущая подписка:`);
				console.log(`     - ID: ${subscription.id}`);
				console.log(`     - Статус: ${subscription.status}`);
				console.log(`     - Тип: ${subscription.planType}`);
				console.log(`     - Начало: ${subscription.startDate}`);
				console.log(`     - Истекает: ${subscription.expiresAt}`);
				console.log(`     - TransactionId: ${subscription.cloudPaymentsTransactionId || "нет"}`);
			} else {
				console.log(`   Подписки нет`);
			}
		}

		// Тест 2: Проверяем логику завершения подписок
		console.log("\n\n2️⃣ Тестируем логику завершения подписок:");

		for (const user of users) {
			const subscription = await getSubscriptionByUserId(user.id);
			if (subscription && subscription.status === "active") {
				console.log(`\n🔄 Обрабатываем активную подписку пользователя ${user.email}:`);

				const currentDate = new Date();
				const isExpired = subscription.expiresAt && subscription.expiresAt <= currentDate;

				console.log(`   - Текущая дата: ${currentDate}`);
				console.log(`   - Дата истечения: ${subscription.expiresAt}`);
				console.log(`   - Истекла: ${isExpired}`);

				if (isExpired) {
					console.log(`   ⚠️  Подписка истекла, нужно обновить статус на "unsubscribed"`);
				} else {
					console.log(`   ✅ Подписка активна`);
				}
			}
		}

		console.log("\n✅ Тестирование завершено!");
	} catch (error) {
		console.error("❌ Ошибка при тестировании:", error);
	} finally {
		await pool.end();
	}
}

// Запускаем тест
testTrialLogic();
