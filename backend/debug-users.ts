import { pool } from "./src/config/database";
import dotenv from "dotenv";

dotenv.config();

async function debugUsers() {
	try {
		console.log("🔍 ДЕТАЛЬНАЯ ВЫГРУЗКА ПОЛЬЗОВАТЕЛЕЙ И ПОДПИСОК");
		console.log("=".repeat(80));

		const startDate = "2025-09-25 00:00:00";

		// 1. Все пользователи с 25.09.2025
		console.log("\n📋 ВСЕ ПОЛЬЗОВАТЕЛИ С 25.09.2025:");
		console.log("-".repeat(50));

		const allUsersResult = await pool.query(
			`
			SELECT 
				id, 
				email, 
				created_at,
				email_verified,
				trial_used
			FROM users 
			WHERE created_at >= $1 
			ORDER BY created_at DESC
		`,
			[startDate]
		);

		console.log(`Найдено пользователей: ${allUsersResult.rows.length}`);
		allUsersResult.rows.forEach((user, index) => {
			console.log(`${index + 1}. ID: ${user.id}`);
			console.log(`   Email: ${user.email}`);
			console.log(`   Создан: ${user.created_at}`);
			console.log(`   Email подтвержден: ${user.email_verified}`);
			console.log(`   Trial использован: ${user.trial_used}`);
			console.log("");
		});

		// 2. Все подписки с 25.09.2025
		console.log("\n📋 ВСЕ ПОДПИСКИ ПОЛЬЗОВАТЕЛЕЙ С 25.09.2025:");
		console.log("-".repeat(50));

		const allSubscriptionsResult = await pool.query(
			`
			SELECT 
				s.id as subscription_id,
				s.user_id,
				u.email,
				s.status,
				s.plan_type,
				s.start_date,
				s.expires_at,
				s.cancelled_at,
				s.created_at as subscription_created,
				s.cloudpayments_subscription_id
			FROM subscriptions s
			INNER JOIN users u ON s.user_id = u.id
			WHERE u.created_at >= $1 
			ORDER BY s.created_at DESC
		`,
			[startDate]
		);

		console.log(`Найдено подписок: ${allSubscriptionsResult.rows.length}`);
		allSubscriptionsResult.rows.forEach((sub, index) => {
			console.log(`${index + 1}. Подписка ID: ${sub.subscription_id}`);
			console.log(`   Пользователь: ${sub.email} (${sub.user_id})`);
			console.log(`   Статус: ${sub.status}`);
			console.log(`   Тип: ${sub.plan_type}`);
			console.log(`   Создана: ${sub.subscription_created}`);
			console.log(`   Начало: ${sub.start_date}`);
			console.log(`   Истекает: ${sub.expires_at}`);
			console.log(`   Отменена: ${sub.cancelled_at}`);
			console.log(`   CloudPayments ID: ${sub.cloudpayments_subscription_id || "нет"}`);
			console.log("");
		});

		// 3. Анализ категорий
		console.log("\n📊 АНАЛИЗ ПО КАТЕГОРИЯМ:");
		console.log("-".repeat(50));

		// Активные пробные
		const activeTrialResult = await pool.query(
			`
			SELECT u.email, s.status, s.plan_type, s.expires_at
			FROM subscriptions s
			INNER JOIN users u ON s.user_id = u.id
			WHERE s.status = 'active' 
			AND s.plan_type = 'trial'
			AND (s.expires_at IS NULL OR s.expires_at > NOW())
			AND u.created_at >= $1
		`,
			[startDate]
		);

		console.log(`🆓 АКТИВНЫЕ ПРОБНЫЕ (${activeTrialResult.rows.length}):`);
		activeTrialResult.rows.forEach((user) => {
			console.log(`   - ${user.email} (истекает: ${user.expires_at})`);
		});

		// Закончившиеся пробные
		const expiredTrialResult = await pool.query(
			`
			SELECT u.email, s.status, s.plan_type, s.expires_at, s.cancelled_at
			FROM subscriptions s
			INNER JOIN users u ON s.user_id = u.id
			WHERE s.plan_type = 'trial'
			AND (s.status = 'cancelled' OR s.status = 'unsubscribed' OR 
				 (s.status = 'active' AND s.expires_at IS NOT NULL AND s.expires_at <= NOW()))
			AND u.created_at >= $1
		`,
			[startDate]
		);

		console.log(`\n⏰ ЗАКОНЧИВШИЕСЯ ПРОБНЫЕ (${expiredTrialResult.rows.length}):`);
		expiredTrialResult.rows.forEach((user) => {
			console.log(`   - ${user.email}`);
			console.log(`     Статус: ${user.status}`);
			console.log(`     Истекает: ${user.expires_at}`);
			console.log(`     Отменена: ${user.cancelled_at}`);
		});

		// Активные премиум
		const activePremiumResult = await pool.query(
			`
			SELECT u.email, s.status, s.plan_type, s.expires_at
			FROM subscriptions s
			INNER JOIN users u ON s.user_id = u.id
			WHERE s.status = 'active' 
			AND s.plan_type = 'premium'
			AND (s.expires_at IS NULL OR s.expires_at > NOW())
			AND u.created_at >= $1
		`,
			[startDate]
		);

		console.log(`\n💎 АКТИВНЫЕ ПРЕМИУМ (${activePremiumResult.rows.length}):`);
		activePremiumResult.rows.forEach((user) => {
			console.log(`   - ${user.email} (истекает: ${user.expires_at})`);
		});

		// Закончившиеся премиум
		const expiredPremiumResult = await pool.query(
			`
			SELECT u.email, s.status, s.plan_type, s.expires_at, s.cancelled_at
			FROM subscriptions s
			INNER JOIN users u ON s.user_id = u.id
			WHERE s.plan_type = 'premium'
			AND (s.status = 'cancelled' OR s.status = 'unsubscribed' OR 
				 (s.status = 'active' AND s.expires_at IS NOT NULL AND s.expires_at <= NOW()))
			AND u.created_at >= $1
		`,
			[startDate]
		);

		console.log(`\n💸 ЗАКОНЧИВШИЕСЯ ПРЕМИУМ (${expiredPremiumResult.rows.length}):`);
		expiredPremiumResult.rows.forEach((user) => {
			console.log(`   - ${user.email}`);
			console.log(`     Статус: ${user.status}`);
			console.log(`     Истекает: ${user.expires_at}`);
			console.log(`     Отменена: ${user.cancelled_at}`);
		});

		console.log("\n" + "=".repeat(80));
	} catch (error) {
		console.error("❌ Ошибка:", error);
	} finally {
		await pool.end();
	}
}

debugUsers();
