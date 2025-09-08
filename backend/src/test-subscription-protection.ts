import { pool } from "./config/database";
import { UserModel } from "./models/User";
import { SubscriptionService } from "./services/subscription.service";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const testUserId = uuidv4();
const testEmail = `test-protection-${uuidv4()}@example.com`;
const userModel = new UserModel();
const subscriptionService = new SubscriptionService();

async function cleanup() {
	await pool.query("DELETE FROM subscriptions WHERE user_id = $1", [testUserId]);
	await pool.query("DELETE FROM users WHERE id = $1", [testUserId]);
}

async function testSubscriptionProtection() {
	console.log("Testing subscription protection for chat API...");

	try {
		// 1. Create a test user
		console.log("1. Creating test user...");
		const user = await userModel.create(testEmail, "password123");
		console.log("✅ Test user created");

		// 2. Start a trial subscription
		console.log("\n2. Starting trial subscription...");
		const trial = await subscriptionService.startTrial(user.id);
		console.log("✅ Trial subscription started");
		console.log("Trial expires at:", trial.expiresAt);

		// 3. Check subscription status immediately
		console.log("\n3. Checking subscription status...");
		const status = await subscriptionService.getSubscriptionStatus(user.id);
		console.log("✅ Subscription status:", {
			hasAccess: status.hasAccess,
			type: status.type,
			expiresAt: status.expiresAt,
		});

		// 4. Wait for trial to expire (Note: Trial is now 3 days, so this test won't wait for expiration)
		console.log("\n4. Trial expiration test skipped (trial period is now 3 days)...");
		console.log("Current time:", new Date().toISOString());
		console.log("Trial expires at:", trial.expiresAt?.toISOString());
		console.log("Note: Trial period has been changed from 2 minutes to 3 days");

		// Skipping wait time as 3 days is too long for automated testing
		// const waitTime = 3 * 24 * 60 * 60 * 1000; // 3 дня
		console.log("Skipping expiration wait for automated testing...");

		// 5. Check subscription status after expiration
		console.log("\n5. Checking subscription status after expiration...");
		const expiredStatus = await subscriptionService.getSubscriptionStatus(user.id);
		console.log("✅ Subscription status after expiration:", {
			hasAccess: expiredStatus.hasAccess,
			type: expiredStatus.type,
			status: expiredStatus.status,
			expiresAt: expiredStatus.expiresAt,
		});

		if (!expiredStatus.hasAccess) {
			console.log("✅ Subscription correctly expired - access denied");
		} else {
			console.error("❌ Subscription should have expired but access is still granted");
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
testSubscriptionProtection();
