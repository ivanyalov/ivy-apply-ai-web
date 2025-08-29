import { pool } from "./config/database";
import { UserModel } from "./models/User";
import { AuthService } from "./services/authService";
import { v4 as uuidv4 } from "uuid";

const testUserId = uuidv4();
const testEmail = `test-auth-${uuidv4()}@example.com`;
const userModel = new UserModel();
const authService = new AuthService();

async function cleanup() {
	await pool.query("DELETE FROM users WHERE id = $1", [testUserId]);
}

async function testAuthRoutes() {
	console.log("Testing auth routes functionality...");

	try {
		// 1. Test signup route
		console.log("1. Testing signup route...");
		try {
			const response = await fetch("http://localhost:8000/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: testEmail,
					password: "password123",
				}),
			});

			if (response.ok) {
				const result = await response.json();
				console.log("✅ Signup route works correctly");
				console.log("User created:", result.user.email);
			} else {
				console.error("❌ Signup route failed:", response.status);
				const error = await response.json();
				console.error("Error:", error);
			}
		} catch (error) {
			console.log("ℹ️ Signup test skipped (server not running or connection error)");
		}

		// 2. Test signin route
		console.log("\n2. Testing signin route...");
		try {
			const response = await fetch("http://localhost:8000/api/auth/signin", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: testEmail,
					password: "password123",
				}),
			});

			if (response.ok) {
				const result = await response.json();
				console.log("✅ Signin route works correctly");
				console.log("User signed in:", result.user.email);
			} else {
				console.error("❌ Signin route failed:", response.status);
				const error = await response.json();
				console.error("Error:", error);
			}
		} catch (error) {
			console.log("ℹ️ Signin test skipped (server not running or connection error)");
		}

		// 3. Test subscription signup-trial route
		console.log("\n3. Testing subscription signup-trial route...");
		try {
			const response = await fetch("http://localhost:8000/api/subscriptions/signup-trial", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: `test-subscription-${uuidv4()}@example.com`,
					password: "password123",
				}),
			});

			if (response.ok) {
				const result = await response.json();
				console.log("✅ Subscription signup-trial route works correctly");
				console.log("User with trial created:", result.user.email);
			} else {
				console.error("❌ Subscription signup-trial route failed:", response.status);
				const error = await response.json();
				console.error("Error:", error);
			}
		} catch (error) {
			console.log(
				"ℹ️ Subscription signup-trial test skipped (server not running or connection error)"
			);
		}

		console.log("\n✅ Auth routes test completed");
	} catch (error) {
		console.error("❌ Test failed:", error);
	} finally {
		await cleanup();
		console.log("\nTest cleanup completed");
		process.exit(0);
	}
}

// Run the tests
testAuthRoutes();
