import { pool } from "./src/config/database";

/**
 * Тестовый скрипт для проверки сохранения TransactionId в базу данных
 */

async function testTransactionSave() {
	console.log("🧪 Testing TransactionId save to database...\n");

	try {
		// Проверяем подключение к базе
		const connectionTest = await pool.query("SELECT NOW()");
		console.log("✅ Database connection successful");

		// Проверяем структуру таблицы subscriptions
		const tableStructure = await pool.query(`
			SELECT column_name, data_type, is_nullable 
			FROM information_schema.columns 
			WHERE table_name = 'subscriptions' 
			AND column_name LIKE '%cloudpayments%'
			ORDER BY ordinal_position
		`);

		console.log("\n📋 CloudPayments columns in subscriptions table:");
		tableStructure.rows.forEach((row) => {
			console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
		});

		// Проверяем существующие записи с TransactionId
		const existingTransactions = await pool.query(`
			SELECT 
				id, 
				user_id, 
				status, 
				plan_type,
				cloudpayments_transaction_id,
				cloudpayments_subscription_id,
				created_at
			FROM subscriptions 
			WHERE cloudpayments_transaction_id IS NOT NULL
			ORDER BY created_at DESC
			LIMIT 5
		`);

		console.log("\n📊 Existing subscriptions with TransactionId:");
		if (existingTransactions.rows.length > 0) {
			existingTransactions.rows.forEach((row, index) => {
				console.log(`  ${index + 1}. ID: ${row.id}`);
				console.log(`     User: ${row.user_id}`);
				console.log(`     Status: ${row.status}`);
				console.log(`     Plan: ${row.plan_type}`);
				console.log(`     TransactionId: ${row.cloudpayments_transaction_id}`);
				console.log(`     SubscriptionId: ${row.cloudpayments_subscription_id || "N/A"}`);
				console.log(`     Created: ${row.created_at}`);
				console.log("");
			});
		} else {
			console.log("  No subscriptions with TransactionId found yet");
		}

		// Проверяем индексы
		const indexes = await pool.query(`
			SELECT indexname, indexdef 
			FROM pg_indexes 
			WHERE tablename = 'subscriptions' 
			AND indexname LIKE '%cloudpayments%'
		`);

		console.log("\n🔍 CloudPayments indexes:");
		if (indexes.rows.length > 0) {
			indexes.rows.forEach((row) => {
				console.log(`  - ${row.indexname}: ${row.indexdef}`);
			});
		} else {
			console.log("  No CloudPayments indexes found");
		}

		console.log("\n✅ Database structure test completed successfully!");
		console.log("\n📝 Next steps:");
		console.log("1. Test the payment flow with CloudPayments widget");
		console.log("2. Check if TransactionId is saved correctly");
		console.log("3. Verify subscription status updates");
	} catch (error) {
		console.error("❌ Test failed:", error);
	} finally {
		await pool.end();
	}
}

// Запуск теста
if (require.main === module) {
	testTransactionSave();
}
