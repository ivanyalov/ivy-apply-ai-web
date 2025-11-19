import { pool } from "./src/config/database";

/**
 * Production Script: Fix User Subscription Access
 * 
 * This script diagnoses and fixes subscription access issues for users who paid
 * but lost access to the service.
 * 
 * Usage:
 *   npx ts-node fix-user-subscription.ts USER_ID_HERE
 * 
 * Example:
 *   npx ts-node fix-user-subscription.ts abc-123-def-456
 */

interface Subscription {
	id: string;
	user_id: string;
	status: string;
	plan_type: string;
	start_date: Date;
	expires_at: Date | null;
	cloudpayments_subscription_id: string | null;
	cloudpayments_transaction_id: string | null;
	cancelled_at: Date | null;
	created_at: Date;
	updated_at: Date;
}

interface Payment {
	id: string;
	user_id: string;
	subscription_id: string | null;
	cloudpayments_invoice_id: string | null;
	cloudpayments_subscription_id: string | null;
	amount: number;
	currency: string;
	status: string;
	created_at: Date;
}

async function fixUserSubscription(userId: string) {
	try {
		console.log("🔍 DIAGNOSING SUBSCRIPTION ISSUE");
		console.log("================================\n");
		console.log(`User ID: ${userId}\n`);

		// Step 1: Get all subscriptions for the user
		console.log("📋 Step 1: Fetching all subscriptions...");
		const subscriptionsResult = await pool.query<Subscription>(
			`SELECT 
				id,
				user_id,
				status,
				plan_type,
				start_date,
				expires_at,
				cloudpayments_subscription_id,
				cloudpayments_transaction_id,
				cancelled_at,
				created_at,
				updated_at
			FROM subscriptions 
			WHERE user_id = $1
			ORDER BY created_at DESC`,
			[userId]
		);

		const subscriptions = subscriptionsResult.rows;
		
		if (subscriptions.length === 0) {
			console.log("❌ No subscriptions found for this user.");
			console.log("\n📋 Checking payments...");
			
			const paymentsResult = await pool.query<Payment>(
				`SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
				[userId]
			);
			
			if (paymentsResult.rows.length > 0) {
				console.log(`✅ Found ${paymentsResult.rows.length} payment(s)`);
				const lastSuccessfulPayment = paymentsResult.rows.find(p => p.status === 'succeeded');
				
				if (lastSuccessfulPayment) {
					console.log("\n🔧 CREATING NEW SUBSCRIPTION FROM PAYMENT...");
					await createSubscriptionFromPayment(userId, lastSuccessfulPayment);
					console.log("✅ Subscription created successfully!");
					return;
				}
			}
			
			console.log("❌ No successful payments found. Cannot create subscription.");
			return;
		}

		console.log(`✅ Found ${subscriptions.length} subscription(s)\n`);

		// Display all subscriptions
		subscriptions.forEach((sub, index) => {
			const now = new Date();
			const isExpired = sub.expires_at ? sub.expires_at <= now : true;
			const hasAccess = sub.status === 'active' && sub.expires_at && sub.expires_at > now;
			
			console.log(`Subscription ${index + 1}:`);
			console.log(`  ID: ${sub.id}`);
			console.log(`  Status: ${sub.status}`);
			console.log(`  Plan: ${sub.plan_type}`);
			console.log(`  Expires: ${sub.expires_at ? sub.expires_at.toISOString() : 'NULL'}`);
			console.log(`  Is Expired: ${isExpired ? '⚠️ YES' : '✅ NO'}`);
			console.log(`  Has Access: ${hasAccess ? '✅ YES' : '❌ NO'}`);
			console.log(`  Created: ${sub.created_at.toISOString()}`);
			console.log(`  Transaction ID: ${sub.cloudpayments_transaction_id || 'none'}`);
			console.log("");
		});

		// Step 2: Get all payments for the user
		console.log("📋 Step 2: Fetching payment history...");
		const paymentsResult = await pool.query<Payment>(
			`SELECT 
				id,
				user_id,
				subscription_id,
				cloudpayments_invoice_id,
				cloudpayments_subscription_id,
				amount,
				currency,
				status,
				created_at
			FROM payments 
			WHERE user_id = $1
			ORDER BY created_at DESC`,
			[userId]
		);

		const payments = paymentsResult.rows;
		console.log(`✅ Found ${payments.length} payment(s)\n`);

		if (payments.length > 0) {
			payments.forEach((payment, index) => {
				console.log(`Payment ${index + 1}:`);
				console.log(`  ID: ${payment.id}`);
				console.log(`  Amount: ${payment.amount} ${payment.currency}`);
				console.log(`  Status: ${payment.status}`);
				console.log(`  Created: ${payment.created_at.toISOString()}`);
				console.log(`  Invoice ID: ${payment.cloudpayments_invoice_id || 'none'}`);
				console.log("");
			});
		}

		// Step 3: Determine the issue and fix
		console.log("🔧 Step 3: Applying Fix...\n");

		const latestSubscription = subscriptions[0];
		const now = new Date();
		const lastSuccessfulPayment = payments.find(p => p.status === 'succeeded');

		// Scenario A: Latest subscription is cancelled but user paid
		if (latestSubscription.status !== 'active' && lastSuccessfulPayment) {
			console.log("📌 Issue identified: Subscription status is not 'active' but payment succeeded");
			console.log("🔧 Fix: Activating subscription and extending expiry date...\n");
			
			await pool.query(
				`UPDATE subscriptions 
				SET 
					status = 'active',
					plan_type = 'premium',
					expires_at = GREATEST(expires_at, NOW() + INTERVAL '30 days'),
					cancelled_at = NULL,
					updated_at = CURRENT_TIMESTAMP
				WHERE id = $1`,
				[latestSubscription.id]
			);

			console.log("✅ Subscription activated!");
		}
		// Scenario B: Subscription is active but expired
		else if (latestSubscription.status === 'active' && latestSubscription.expires_at && latestSubscription.expires_at <= now && lastSuccessfulPayment) {
			console.log("📌 Issue identified: Subscription is active but expires_at is in the past");
			console.log("🔧 Fix: Extending expiry date by 30 days...\n");
			
			await pool.query(
				`UPDATE subscriptions 
				SET 
					expires_at = NOW() + INTERVAL '30 days',
					updated_at = CURRENT_TIMESTAMP
				WHERE id = $1`,
				[latestSubscription.id]
			);

			console.log("✅ Subscription expiry extended!");
		}
		// Scenario C: Multiple subscriptions - wrong one is latest
		else if (subscriptions.length > 1 && lastSuccessfulPayment) {
			// Find subscription linked to the latest successful payment
			const correctSubscription = subscriptions.find(
				sub => sub.id === lastSuccessfulPayment.subscription_id
			);

			if (correctSubscription && correctSubscription.id !== latestSubscription.id) {
				console.log("📌 Issue identified: Multiple subscriptions exist, wrong one is latest");
				console.log("🔧 Fix: Making the paid subscription the latest one...\n");
				
				// Update the correct subscription to be the latest
				await pool.query(
					`UPDATE subscriptions 
					SET 
						created_at = NOW(),
						status = 'active',
						plan_type = 'premium',
						expires_at = GREATEST(expires_at, NOW() + INTERVAL '30 days'),
						cancelled_at = NULL,
						updated_at = CURRENT_TIMESTAMP
					WHERE id = $1`,
					[correctSubscription.id]
				);

				// Cancel other subscriptions
				await pool.query(
					`UPDATE subscriptions 
					SET 
						status = 'cancelled',
						cancelled_at = NOW(),
						updated_at = CURRENT_TIMESTAMP
					WHERE user_id = $1 
					  AND id != $2
					  AND status = 'active'`,
					[userId, correctSubscription.id]
				);

				console.log("✅ Correct subscription is now active and latest!");
			} else {
				// If latest subscription is already correct, just ensure it's active
				console.log("📌 Issue identified: Subscription needs activation");
				console.log("🔧 Fix: Ensuring subscription is active with valid expiry...\n");
				
				await pool.query(
					`UPDATE subscriptions 
					SET 
						status = 'active',
						plan_type = 'premium',
						expires_at = GREATEST(expires_at, NOW() + INTERVAL '30 days'),
						cancelled_at = NULL,
						updated_at = CURRENT_TIMESTAMP
					WHERE id = $1`,
					[latestSubscription.id]
				);

				console.log("✅ Subscription fixed!");
			}
		}
		// Scenario D: Subscription looks fine, just needs to be ensured
		else {
			console.log("📌 Issue identified: Subscription needs refresh and validation");
			console.log("🔧 Fix: Ensuring subscription is active and valid...\n");
			
			await pool.query(
				`UPDATE subscriptions 
				SET 
					status = 'active',
					plan_type = CASE 
						WHEN plan_type = 'trial' AND $2 = true THEN 'premium'
						ELSE plan_type 
					END,
					expires_at = CASE 
						WHEN expires_at IS NULL OR expires_at <= NOW() 
						THEN NOW() + INTERVAL '30 days'
						ELSE expires_at
					END,
					cancelled_at = NULL,
					updated_at = CURRENT_TIMESTAMP
				WHERE id = $1`,
				[latestSubscription.id, !!lastSuccessfulPayment]
			);

			console.log("✅ Subscription refreshed!");
		}

		// Step 4: Verify the fix
		console.log("\n✅ Step 4: Verifying fix...\n");
		
		const verifyResult = await pool.query<Subscription>(
			`SELECT 
				id,
				status,
				plan_type,
				expires_at,
				CASE 
					WHEN status = 'active' AND expires_at > NOW() 
					THEN true 
					ELSE false 
				END as has_access
			FROM subscriptions 
			WHERE user_id = $1
			ORDER BY created_at DESC 
			LIMIT 1`,
			[userId]
		);

		const verifiedSub = verifyResult.rows[0];
		
		if (verifiedSub) {
			console.log("📊 VERIFICATION RESULT:");
			console.log("======================");
			console.log(`Subscription ID: ${verifiedSub.id}`);
			console.log(`Status: ${verifiedSub.status}`);
			console.log(`Plan Type: ${verifiedSub.plan_type}`);
			console.log(`Expires At: ${verifiedSub.expires_at ? verifiedSub.expires_at.toISOString() : 'NULL'}`);
			console.log(`Has Access: ${(verifiedSub as any).has_access ? '✅ YES' : '❌ NO'}`);
			
			if ((verifiedSub as any).has_access) {
				console.log("\n🎉 SUCCESS! User now has access to the service!");
				console.log("The user can log in and use the chat feature.");
			} else {
				console.log("\n⚠️ WARNING! User still doesn't have access.");
				console.log("Please check the subscription details manually.");
			}
		}

	} catch (error) {
		console.error("\n❌ ERROR:", error);
		throw error;
	} finally {
		await pool.end();
	}
}

async function createSubscriptionFromPayment(userId: string, payment: Payment) {
	const result = await pool.query(
		`INSERT INTO subscriptions (
			user_id,
			status,
			plan_type,
			start_date,
			expires_at,
			cloudpayments_transaction_id,
			cloudpayments_subscription_id
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, status, plan_type, expires_at`,
		[
			userId,
			'active',
			'premium',
			new Date(),
			new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
			payment.cloudpayments_invoice_id,
			payment.cloudpayments_subscription_id
		]
	);

	console.log(`✅ Created subscription ${result.rows[0].id}`);
	console.log(`   Status: ${result.rows[0].status}`);
	console.log(`   Plan: ${result.rows[0].plan_type}`);
	console.log(`   Expires: ${result.rows[0].expires_at.toISOString()}`);
}

// Main execution
const userId = process.argv[2];

if (!userId) {
	console.error("❌ Error: User ID is required");
	console.log("\nUsage:");
	console.log("  npx ts-node fix-user-subscription.ts USER_ID_HERE");
	console.log("\nExample:");
	console.log("  npx ts-node fix-user-subscription.ts abc-123-def-456");
	process.exit(1);
}

fixUserSubscription(userId).catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});

