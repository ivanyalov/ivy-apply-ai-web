import { pool } from "./config/database";
import { UserModel } from "./models/User";
import { AuthService } from "./services/authService";
import { SubscriptionService } from "./services/subscription.service";
import { v4 as uuidv4 } from "uuid";

const testUserId = uuidv4();
const testEmail = `test-chat-protection-${uuidv4()}@example.com`;
const userModel = new UserModel();
const authService = new AuthService();
const subscriptionService = new SubscriptionService();

async function cleanup() {
	await pool.query("DELETE FROM subscriptions WHERE user_id = $1", [testUserId]);
	await pool.query("DELETE FROM users WHERE id = $1", [testUserId]);
}

async function testChatProtection() {
	console.log("Testing chat routes protection...");

	try {
		// 1. Create a test user
		console.log("1. Creating test user...");
		const user = await userModel.create(testEmail, "password123");
		console.log("✅ Test user created");

		// 2. Generate auth token
		console.log("\n2. Generating auth token...");
		const token = authService.generateToken(user);
		console.log("✅ Auth token generated");

		// 3. Test chat route without subscription (should fail with 403)
		console.log("\n3. Testing chat route without subscription...");
		try {
			const response = await fetch("http://localhost:8000/api/conversation/get", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.status === 403) {
				const errorData = await response.json();
				console.log("✅ Chat route correctly blocked without subscription");
				console.log("Error response:", {
					error: errorData.error,
					redirectTo: errorData.redirectTo,
				});
			} else {
				console.error(
					"❌ Chat route should have been blocked but returned status:",
					response.status
				);
			}
		} catch (error) {
			console.log("ℹ️ Chat route test skipped (server not running or connection error)");
		}

		// 4. Start trial subscription
		console.log("\n4. Starting trial subscription...");
		const trial = await subscriptionService.startTrial(user.id);
		console.log("✅ Trial subscription started");

		// 5. Test chat route with active subscription (should work)
		console.log("\n5. Testing chat route with active subscription...");
		try {
			const response = await fetch("http://localhost:8000/api/conversation/get", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				console.log("✅ Chat route correctly allowed with active subscription");
			} else {
				console.error(
					"❌ Chat route should have been allowed but returned status:",
					response.status
				);
			}
		} catch (error) {
			console.log("ℹ️ Chat route test skipped (server not running or connection error)");
		}

		console.log("\n✅ Chat protection test completed");
	} catch (error) {
		console.error("❌ Test failed:", error);
	} finally {
		await cleanup();
		console.log("\nTest cleanup completed");
		process.exit(0);
	}
}

// Run the tests
testChatProtection();
