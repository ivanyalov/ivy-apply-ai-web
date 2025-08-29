import { getEmailService } from "./services/emailService";
import dotenv from "dotenv";

dotenv.config();

async function testEmailService() {
	console.log("Testing email service...");

	// Получаем экземпляр сервиса после загрузки переменных окружения
	const emailService = getEmailService();

	try {
		// 1. Проверяем подключение к SMTP
		console.log("1. Testing SMTP connection...");
		const connectionOk = await emailService.verifyConnection();

		if (connectionOk) {
			console.log("✅ SMTP connection successful");
		} else {
			console.log("❌ SMTP connection failed");
			return;
		}

		// 2. Тестируем отправку простого письма
		console.log("\n2. Testing simple email sending...");
		const testEmail = "test@example.com"; // Замените на реальный email для тестирования

		const emailSent = await emailService.testEmail(testEmail);

		if (emailSent) {
			console.log("✅ Test email sent successfully");
		} else {
			console.log("❌ Test email failed");
		}

		// 3. Тестируем отправку письма верификации
		console.log("\n3. Testing verification email...");
		try {
			await emailService.sendVerificationEmail({
				email: testEmail,
				verificationToken: "test-token-123",
				userFirstName: "Test User",
			});
			console.log("✅ Verification email sent successfully");
		} catch (error) {
			console.log("❌ Verification email failed:", error);
		}

		console.log("\n✅ Email service test completed");
	} catch (error) {
		console.error("❌ Test failed:", error);
	} finally {
		process.exit(0);
	}
}

// Run the tests
testEmailService();
