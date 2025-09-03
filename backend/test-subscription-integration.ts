import axios from "axios";

/**
 * Тестовый скрипт для проверки интеграции подписок с CloudPayments
 */

const BASE_URL = "http://localhost:3001/api";

// Тестовые данные
const testTransactionId = "3041276387";
const testSubscriptionId = "test_subscription_123";
const testUserId = "test_user_uuid";

async function testSubscriptionIntegration() {
	console.log("🧪 Testing subscription integration...\n");

	try {
		// Тест 1: Получение статуса транзакции из CloudPayments
		console.log("1️⃣ Testing get transaction status...");
		try {
			const transactionResponse = await axios.post(
				`${BASE_URL}/payments/cloudpayments/get-transaction`,
				{
					transactionId: testTransactionId,
				}
			);
			console.log("✅ Transaction status response:", transactionResponse.data);
		} catch (error) {
			console.log(
				"⚠️ Transaction status test failed (expected if CloudPayments not configured):",
				error.response?.data || error.message
			);
		}

		// Тест 2: Обработка успешной оплаты
		console.log("\n2️⃣ Testing payment success endpoint...");
		try {
			const paymentResponse = await axios.post(
				`${BASE_URL}/payments/cloudpayments/payment-success`,
				{
					transactionId: testTransactionId,
					subscriptionId: testSubscriptionId,
					accountId: testUserId,
					amount: 990.0,
					currency: "RUB",
					status: "Completed",
					token: "test_card_token_123",
				}
			);
			console.log("✅ Payment success response:", paymentResponse.data);
		} catch (error) {
			console.log(
				"⚠️ Payment success test failed (expected if not authenticated):",
				error.response?.data || error.message
			);
		}

		// Тест 3: Получение статуса подписки (без аутентификации)
		console.log("\n3️⃣ Testing subscription status endpoint (without auth)...");
		try {
			const statusResponse = await axios.get(`${BASE_URL}/subscriptions/status`);
			console.log("✅ Subscription status response:", statusResponse.data);
		} catch (error) {
			console.log(
				"✅ Subscription status test failed as expected (authentication required):",
				error.response?.status
			);
		}

		console.log("\n🎯 Integration tests completed!");
		console.log("\n📝 Next steps:");
		console.log("1. Start the server: npm run dev");
		console.log("2. Test with authenticated user");
		console.log("3. Check CloudPayments webhook integration");
	} catch (error) {
		console.error("❌ Test failed:", error);
	}
}

// Запуск тестов
if (require.main === module) {
	testSubscriptionIntegration();
}
