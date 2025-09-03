import { pool } from "./src/config/database";
import { subscriptionService } from "./src/services/subscription.service";
import { AuthService } from "./src/services/authService";

async function testAuthPayment() {
	try {
		console.log("🧪 Тестируем авторизацию в payment-success endpoint...\n");

		// Получаем пользователя для тестирования
		const usersResult = await pool.query("SELECT id, email FROM users LIMIT 1");
		const user = usersResult.rows[0];

		if (!user) {
			console.log("❌ Нет пользователей для тестирования");
			return;
		}

		console.log(`👤 Тестируем с пользователем: ${user.email} (ID: ${user.id})`);

		// Создаем тестовый токен
		const authService = new AuthService();
		const token = authService.generateToken(user);
		console.log(`🔑 Создан тестовый токен: ${token.substring(0, 20)}...`);

		// Тестируем verifyToken
		try {
			const decoded = authService.verifyToken(token);
			console.log(`✅ Токен успешно верифицирован:`, decoded);
		} catch (error) {
			console.error(`❌ Ошибка верификации токена:`, error);
			return;
		}

		// Тестируем получение статуса подписки
		try {
			const subscriptionStatus = await subscriptionService.getSubscriptionStatus(user.id);
			console.log(`📋 Статус подписки пользователя:`);
			console.log(`   - hasAccess: ${subscriptionStatus.hasAccess}`);
			console.log(`   - type: ${subscriptionStatus.type || "null"}`);
			console.log(`   - status: ${subscriptionStatus.status}`);
		} catch (error) {
			console.error(`❌ Ошибка получения статуса подписки:`, error);
		}

		console.log("\n✅ Тестирование авторизации завершено!");
	} catch (error) {
		console.error("❌ Ошибка при тестировании:", error);
	} finally {
		await pool.end();
	}
}

// Запускаем тест
testAuthPayment();
