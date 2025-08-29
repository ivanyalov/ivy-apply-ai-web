import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function testEmailSSL() {
	console.log("Testing email with SSL (port 465)...");

	try {
		// Создаем транспортер с SSL
		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST || "smtp.yandex.ru",
			port: 465,
			secure: true, // SSL
			auth: {
				user: process.env.SMTP_USER || "",
				pass: process.env.SMTP_PASS || "",
			},
			debug: true,
			logger: true,
		});

		// Проверяем подключение
		console.log("1. Testing SMTP connection...");
		await transporter.verify();
		console.log("✅ SMTP connection successful");

		// Отправляем тестовое письмо
		console.log("\n2. Sending test email...");
		const testEmail = "test@example.com"; // Замените на реальный email

		const mailOptions = {
			from: `"Ivy Apply AI" <${process.env.SMTP_USER}>`,
			to: testEmail,
			subject: "Тестовое письмо SSL - Ivy Apply AI",
			text: "Это тестовое письмо отправлено через SSL соединение.",
			html: `
				<html>
					<body>
						<h2>Тестовое письмо SSL</h2>
						<p>Это тестовое письмо отправлено через SSL соединение.</p>
						<p>Время отправки: ${new Date().toLocaleString("ru-RU")}</p>
					</body>
				</html>
			`,
		};

		await transporter.sendMail(mailOptions);
		console.log("✅ Test email sent successfully via SSL");
	} catch (error) {
		console.error("❌ SSL email test failed:", error);
	} finally {
		process.exit(0);
	}
}

testEmailSSL();
