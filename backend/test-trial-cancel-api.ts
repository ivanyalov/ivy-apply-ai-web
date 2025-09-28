import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}`;
const TEST_EMAIL = "test-trial-cancel-api@example.com";
const TEST_PASSWORD = "testpassword123";

async function testTrialCancellationAPI() {
	try {
		console.log("🧪 Тестирование отмены пробной подписки через API...\n");

		// 1. Регистрируем пользователя
		console.log("1️⃣ Регистрируем тестового пользователя...");
		try {
			const registerResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
				email: TEST_EMAIL,
				password: TEST_PASSWORD,
			});
			console.log(`   ✅ Пользователь зарегистрирован: ${registerResponse.data.user.id}`);
		} catch (error: any) {
			if (error.response?.status === 409) {
				console.log("   ℹ️ Пользователь уже существует, продолжаем...");
			} else {
				throw error;
			}
		}

		// 2. Логинимся
		console.log("\n2️⃣ Логинимся...");
		const loginResponse = await axios.post(`${BASE_URL}/api/auth/signin`, {
			email: TEST_EMAIL,
			password: TEST_PASSWORD,
		});
		const token = loginResponse.data.token;
		console.log(`   ✅ Токен получен: ${token.substring(0, 20)}...`);

		// 3. Запускаем пробную подписку
		console.log("\n3️⃣ Запускаем пробную подписку...");
		const trialResponse = await axios.post(
			`${BASE_URL}/api/subscriptions/start-trial`,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);
		console.log(`   ✅ Пробная подписка запущена:`, trialResponse.data);

		// 4. Проверяем статус подписки
		console.log("\n4️⃣ Проверяем статус подписки...");
		const statusResponse = await axios.get(`${BASE_URL}/api/subscriptions/status`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		console.log(`   📊 Статус до отмены:`, statusResponse.data);

		// 5. Отменяем подписку через CloudPayments API
		console.log("\n5️⃣ Отменяем пробную подписку...");
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
		console.log(`   ✅ Ответ API отмены:`, cancelResponse.data);

		// 6. Проверяем статус после отмены
		console.log("\n6️⃣ Проверяем статус после отмены...");
		const statusAfterResponse = await axios.get(`${BASE_URL}/api/subscriptions/status`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		console.log(`   📊 Статус после отмены:`, statusAfterResponse.data);

		// 7. Проверяем результат
		if (statusAfterResponse.data.status === "cancelled") {
			console.log("\n🎉 ТЕСТ ПРОЙДЕН! Пробная подписка успешно отменена через API");
		} else {
			console.error("\n❌ ТЕСТ ПРОВАЛЕН! Статус подписки не изменился на 'cancelled'");
			console.error(`   Ожидалось: cancelled, получено: ${statusAfterResponse.data.status}`);
		}
	} catch (error: any) {
		if (error.response) {
			console.error("❌ Ошибка API:", {
				status: error.response.status,
				statusText: error.response.statusText,
				data: error.response.data,
				url: error.config?.url,
			});
		} else {
			console.error("❌ Ошибка запроса:", error.message);
		}
	}
}

testTrialCancellationAPI();
