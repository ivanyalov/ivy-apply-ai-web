import dotenv from "dotenv";

dotenv.config();

console.log("Environment variables check:");
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "***SET***" : "NOT SET");

// Тестируем создание транспортера напрямую
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "smtp.yandex.ru",
	port: 465,
	secure: true,
	auth: {
		user: process.env.SMTP_USER || "",
		pass: process.env.SMTP_PASS || "",
	},
	debug: true,
	logger: true,
});

async function testDirect() {
	try {
		console.log("\nTesting direct transporter...");
		await transporter.verify();
		console.log("✅ Direct transporter works!");
	} catch (error) {
		console.error("❌ Direct transporter failed:", error);
	}
}

testDirect();
