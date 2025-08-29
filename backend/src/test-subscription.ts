import { pool } from "./config/database";
import { UserModel } from "./models/User";
import { SubscriptionService } from "./services/subscription.service";
import { v4 as uuidv4 } from "uuid";

async function cleanup() {
	// Clean up test data
	await pool.query("DELETE FROM subscriptions WHERE user_id = $1", [testUserId]);
	await pool.query("DELETE FROM users WHERE id = $1", [testUserId]);
}

const testUserId = uuidv4();
const testEmail = `test-${uuidv4()}@example.com`;
const userModel = new UserModel();
const subscriptionService = new SubscriptionService();

async function testTrialSubscription() {
	console.log("Starting trial subscription tests...");

	try {
		// 1. Create a test user
		console.log("1. Creating test user...");
		const user = await userModel.create(testEmail, "password123");
		console.log("✅ Test user created");

		// 2. Start a trial subscription
		console.log("\n2. Starting trial subscription...");
		const trial = await subscriptionService.startTrial(user.id);
		console.log("✅ Trial subscription started");
		console.log("Trial details:", {
			id: trial.id,
			userId: trial.userId,
			status: trial.status,
			planType: trial.planType,
			startDate: trial.startDate,
			expiresAt: trial.expiresAt,
		});

		// 3. Check subscription status
		console.log("\n3. Checking subscription status...");
		const status = await subscriptionService.getSubscriptionStatus(user.id);
		console.log("✅ Subscription status checked");
		console.log("Status details:", {
			hasAccess: status.hasAccess,
			type: status.type,
			expiresAt: status.expiresAt,
		});

		// 4. Verify trial duration is 2 minutes
		if (!trial.startDate || !trial.expiresAt) {
			console.error("❌ Trial dates are missing");
			return;
		}

		const startDate = new Date(trial.startDate);
		const expiresAt = new Date(trial.expiresAt);
		const minutesDiff = Math.ceil((expiresAt.getTime() - startDate.getTime()) / (1000 * 60));

		if (minutesDiff === 2) {
			console.log("✅ Trial duration is correct (2 minutes)");
		} else {
			console.error("❌ Trial duration is incorrect:", minutesDiff, "minutes");
		}

		// 5. Verify subscription is active
		if (status.hasAccess && status.type === "trial") {
			console.log("✅ Subscription is active and type is trial");
		} else {
			console.error("❌ Subscription status is incorrect:", status);
		}
	} catch (error) {
		console.error("❌ Test failed:", error);
	} finally {
		await cleanup();
		console.log("\nTest cleanup completed");
		process.exit(0);
	}
}

// Run the tests
testTrialSubscription();
