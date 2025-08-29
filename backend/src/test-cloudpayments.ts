import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function testCloudPaymentsAPI() {
	console.log("Testing CloudPayments API integration...");

	const publicId = process.env.CLOUD_PAYMENTS_PUBLIC_ID;
	const secretKey = process.env.CLOUD_PAYMENTS_SECRET_KEY;

	console.log("Public ID:", publicId ? "✓ Set" : "✗ Not set");
	console.log("Secret Key:", secretKey ? "✓ Set" : "✗ Not set");

	if (!publicId || !secretKey) {
		console.error("❌ CloudPayments credentials not configured");
		return;
	}

	try {
		// Тестируем подключение к API CloudPayments
		const credentials = Buffer.from(`${publicId}:${secretKey}`).toString("base64");

		console.log("\nTesting CloudPayments API connection...");
		const response = await axios.post(
			"https://api.cloudpayments.ru/test",
			{},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${credentials}`,
				},
			}
		);

		console.log("✅ CloudPayments API connection successful");
		console.log("Response:", response.data);
	} catch (error: any) {
		console.error("❌ CloudPayments API connection failed");
		if (error.response) {
			console.error("Status:", error.response.status);
			console.error("Data:", error.response.data);
		} else {
			console.error("Error:", error.message);
		}
	}
}

// Запускаем тест
testCloudPaymentsAPI().catch(console.error);
