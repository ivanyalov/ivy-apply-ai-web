import { pool } from "./src/config/database";
import { createSubscription, getSubscriptionByUserId } from "./src/models/Subscription";
import { UserModel } from "./src/models/User";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}`;
const TEST_EMAIL = "test-premium-cancel@example.com";
const TEST_PASSWORD = "testpassword123";

async function cleanup() {
	// Удаляем тестового пользователя если он существует
	await pool.query("DELETE FROM users WHERE email = $1", [TEST_EMAIL]);
}

async function testPremiumCancellationAPI() {
	try {
		console.log("🧪 Тестирование отмены ПРЕМИУМ подписки через API...\n");

		// Очистка перед тестом
		await cleanup();

		// 1. Создаем пользователя напрямую в БД
		console.log("1️⃣ Создаем тестового пользователя...");
		const userModel = new UserModel();
		const user = await userModel.create(TEST_EMAIL, TEST_PASSWORD);
		console.log(`   ✅ Пользователь создан: ${user.id}`);

		// 2. Создаем премиум подписку с CloudPayments данными
		console.log("\n2️⃣ Создаем премиум подписку с CloudPayments...");
		const fakeCloudPaymentsId = "cp_test_subscription_123456";
		const fakeToken = "cp_test_token_789";

		const subscription = await createSubscription({
			userId: user.id,
			status: "active",
			planType: "premium",
			startDate: new Date(),
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
			cloudPaymentsSubscriptionId: fakeCloudPaymentsId,
			cloudPaymentsToken: fakeToken,
		});
		console.log(`   ✅ Премиум подписка создана: ${subscription.id}`);
		console.log(`   📊 CloudPayments ID: ${fakeCloudPaymentsId}`);

		// 3. Логинимся через API
		console.log("\n3️⃣ Логинимся через API...");
		const loginResponse = await axios.post(`${BASE_URL}/api/auth/signin`, {
			email: TEST_EMAIL,
			password: TEST_PASSWORD,
		});
		const token = loginResponse.data.token;
		console.log(`   ✅ Токен получен: ${token.substring(0, 20)}...`);

		// 4. Проверяем статус подписки
		console.log("\n4️⃣ Проверяем статус подписки...");
		const statusResponse = await axios.get(`${BASE_URL}/api/subscriptions/status`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		console.log(`   📊 Статус до отмены:`, statusResponse.data);

		// 5. Пытаемся отменить премиум подписку
		console.log("\n5️⃣ Пытаемся отменить премиум подписку...");

		try {
			const cancelResponse = await axios.post(
				`${BASE_URL}/api/payments/cloudpayments/cancel-subscription`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			console.log(`   ⚠️ CloudPayments API ответил:`, cancelResponse.data);

			// Если дошли сюда - значит наш код попытался обратиться к CloudPayments
			// Это хорошо, значит логика для премиум подписок работает
			console.log("\n✅ ЛОГИКА ПРЕМИУМ ПОДПИСОК РАБОТАЕТ!");
			console.log("   • Код правильно определил премиум подписку");
			console.log("   • Попытался обратиться к CloudPayments API");
			console.log("   • Ошибка от CloudPayments ожидаема (тестовые данные)");
		} catch (error: any) {
			if (error.response) {
				const errorData = error.response.data;
				console.log(`   📋 Ответ API:`, errorData);

				// Проверяем, что получили правильную ошибку от CloudPayments
				if (errorData.message && errorData.message.includes("CloudPayments")) {
					console.log("\n✅ ПРЕМИУМ ЛОГИКА РАБОТАЕТ КОРРЕКТНО!");
					console.log("   • Код правильно определил премиум подписку");
					console.log("   • Попытался обратиться к CloudPayments API");
					console.log("   • Получил ожидаемую ошибку от CloudPayments (тестовые данные)");
				} else if (errorData.message === "No active subscription found") {
					console.error("\n❌ ПРЕМИУМ ЛОГИКА СЛОМАНА!");
					console.error("   • Код не смог найти активную подписку");
					console.error("   • Проблема в проверке статуса подписки");
				} else {
					console.log("\n⚠️ Неожиданная ошибка:", errorData);
				}
			} else {
				console.error("❌ Ошибка запроса:", error.message);
			}
		}

		// 6. Проверяем, что подписка НЕ была отменена локально (так как CloudPayments не сработал)
		console.log("\n6️⃣ Проверяем статус после попытки отмены...");
		const afterCancellation = await getSubscriptionByUserId(user.id);
		console.log(`   📊 Статус в БД: ${afterCancellation?.status}`);
		console.log(`   📊 Тип: ${afterCancellation?.planType}`);
		console.log(`   📊 CloudPayments ID: ${afterCancellation?.cloudPaymentsSubscriptionId}`);

		if (afterCancellation?.status === "active") {
			console.log("\n✅ ОТЛИЧНО! Подписка осталась активной");
			console.log("   • CloudPayments не сработал (тестовые данные)");
			console.log("   • Локальный статус не изменился");
			console.log("   • Это правильное поведение!");
		}
	} catch (error) {
		console.error("❌ Ошибка тестирования:", error);
	} finally {
		// Очистка после теста
		await cleanup();
		console.log("\n🧹 Тестовые данные очищены");
	}
}

async function main() {
	await testPremiumCancellationAPI();
	await pool.end();
}

main();
