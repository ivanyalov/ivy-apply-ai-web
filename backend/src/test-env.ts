import dotenv from "dotenv";

dotenv.config();

function testEnvironmentVariables() {
	console.log("Testing environment variables...");

	const requiredVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];

	console.log("\nSMTP Configuration:");
	console.log("===================");

	requiredVars.forEach((varName) => {
		const value = process.env[varName];
		if (value) {
			// Скрываем пароль
			if (varName === "SMTP_PASS") {
				console.log(`${varName}: ${value.substring(0, 3)}***`);
			} else {
				console.log(`${varName}: ${value}`);
			}
		} else {
			console.log(`${varName}: ❌ NOT SET`);
		}
	});

	console.log("\nFrontend URL:");
	console.log("=============");
	console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || "http://localhost:5173 (default)"}`);

	// Проверяем, что все необходимые переменные установлены
	const missingVars = requiredVars.filter((varName) => !process.env[varName]);

	if (missingVars.length > 0) {
		console.log(`\n❌ Missing environment variables: ${missingVars.join(", ")}`);
		console.log("Please set these variables in your .env file");
	} else {
		console.log("\n✅ All required environment variables are set");
	}

	console.log("\nTest completed");
}

testEnvironmentVariables();
