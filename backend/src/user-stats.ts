import { pool } from "./config/database";
import dotenv from "dotenv";

dotenv.config();

interface UserStats {
	totalUsers: number;
	activeTrialUsers: number;
	expiredTrialUsers: number;
	activePremiumUsers: number;
	expiredPremiumUsers: number;
}

/**
 * Получает статистику пользователей из базы данных с 25.09.2025
 */
async function getUserStats(): Promise<UserStats> {
	try {
		// Дата начала отчетности - 25.09.2025
		const startDate = "2025-09-25 00:00:00";

		// Общее количество зарегистрированных пользователей с 25.09.2025
		const totalUsersResult = await pool.query(
			`
            SELECT COUNT(*) as count 
            FROM users
            WHERE created_at >= $1
        `,
			[startDate]
		);
		const totalUsers = parseInt(totalUsersResult.rows[0].count);

		// Количество пользователей с активным пробным периодом (созданных с 25.09.2025)
		const activeTrialResult = await pool.query(
			`
            SELECT COUNT(DISTINCT s.user_id) as count
            FROM subscriptions s
            INNER JOIN users u ON s.user_id = u.id
            WHERE s.status = 'active' 
            AND s.plan_type = 'trial'
            AND (s.expires_at IS NULL OR s.expires_at > NOW())
            AND u.created_at >= $1
        `,
			[startDate]
		);
		const activeTrialUsers = parseInt(activeTrialResult.rows[0].count);

		// Количество пользователей с закончившимся пробным периодом (отменённым/истёкшим)
		const expiredTrialResult = await pool.query(
			`
            SELECT COUNT(DISTINCT s.user_id) as count
            FROM subscriptions s
            INNER JOIN users u ON s.user_id = u.id
            WHERE s.plan_type = 'trial'
            AND (s.status = 'cancelled' OR s.status = 'unsubscribed' OR 
                 (s.status = 'active' AND s.expires_at IS NOT NULL AND s.expires_at <= NOW()))
            AND u.created_at >= $1
        `,
			[startDate]
		);
		const expiredTrialUsers = parseInt(expiredTrialResult.rows[0].count);

		// Количество пользователей с активной премиум подпиской (созданных с 25.09.2025)
		const activePremiumResult = await pool.query(
			`
            SELECT COUNT(DISTINCT s.user_id) as count
            FROM subscriptions s
            INNER JOIN users u ON s.user_id = u.id
            WHERE s.status = 'active' 
            AND s.plan_type = 'premium'
            AND (s.expires_at IS NULL OR s.expires_at > NOW())
            AND u.created_at >= $1
        `,
			[startDate]
		);
		const activePremiumUsers = parseInt(activePremiumResult.rows[0].count);

		// Количество пользователей с закончившейся премиум подпиской (отменённой/истёкшей)
		const expiredPremiumResult = await pool.query(
			`
            SELECT COUNT(DISTINCT s.user_id) as count
            FROM subscriptions s
            INNER JOIN users u ON s.user_id = u.id
            WHERE s.plan_type = 'premium'
            AND (s.status = 'cancelled' OR s.status = 'unsubscribed' OR 
                 (s.status = 'active' AND s.expires_at IS NOT NULL AND s.expires_at <= NOW()))
            AND u.created_at >= $1
        `,
			[startDate]
		);
		const expiredPremiumUsers = parseInt(expiredPremiumResult.rows[0].count);

		return {
			totalUsers,
			activeTrialUsers,
			expiredTrialUsers,
			activePremiumUsers,
			expiredPremiumUsers,
		};
	} catch (error) {
		console.error("Ошибка при получении статистики пользователей:", error);
		throw error;
	}
}

/**
 * Отображает статистику в виде красивой таблицы в консоли
 */
function displayStatsTable(stats: UserStats): void {
	console.log("\n");
	console.log("╔═══════════════════════════════════════════════════════════════╗");
	console.log("║                    📊 СТАТИСТИКА ПОЛЬЗОВАТЕЛЕЙ                ║");
	console.log("║                      (с 25.09.2025)                          ║");
	console.log("╠═══════════════════════════════════════════════════════════════╣");
	console.log("║                                                               ║");
	console.log(
		`║  👥 Общее количество пользователей:          ${stats.totalUsers.toString().padStart(8)} ║`
	);
	console.log("║                                                               ║");
	console.log(
		`║  🆓 Пользователи с активным пробным периодом: ${stats.activeTrialUsers
			.toString()
			.padStart(8)} ║`
	);
	console.log("║                                                               ║");
	console.log(
		`║  ⏰ Пользователи с закончившимся пробным:     ${stats.expiredTrialUsers
			.toString()
			.padStart(8)} ║`
	);
	console.log("║                                                               ║");
	console.log(
		`║  💎 Пользователи с активной подпиской:        ${stats.activePremiumUsers
			.toString()
			.padStart(8)} ║`
	);
	console.log("║                                                               ║");
	console.log(
		`║  💸 Пользователи с закончившейся подпиской:   ${stats.expiredPremiumUsers
			.toString()
			.padStart(8)} ║`
	);
	console.log("║                                                               ║");
	console.log("╚═══════════════════════════════════════════════════════════════╝");
	console.log("\n");

	// Дополнительная статистика
	const conversionRate =
		stats.totalUsers > 0
			? ((stats.activePremiumUsers / stats.totalUsers) * 100).toFixed(2)
			: "0.00";
	const activeTrialRate =
		stats.totalUsers > 0 ? ((stats.activeTrialUsers / stats.totalUsers) * 100).toFixed(2) : "0.00";
	const expiredTrialRate =
		stats.totalUsers > 0 ? ((stats.expiredTrialUsers / stats.totalUsers) * 100).toFixed(2) : "0.00";
	const expiredPremiumRate =
		stats.totalUsers > 0
			? ((stats.expiredPremiumUsers / stats.totalUsers) * 100).toFixed(2)
			: "0.00";

	console.log("📈 Дополнительная аналитика:");
	console.log(`   • Конверсия в премиум: ${conversionRate}%`);
	console.log(`   • Активные пробные: ${activeTrialRate}%`);
	console.log(`   • Закончившиеся пробные: ${expiredTrialRate}%`);
	console.log(`   • Закончившиеся премиум: ${expiredPremiumRate}%`);
	console.log(`   • Дата формирования отчета: ${new Date().toLocaleString("ru-RU")}`);
	console.log("\n");
}

/**
 * Основная функция для запуска скрипта
 */
async function main(): Promise<void> {
	try {
		console.log("🔍 Получение статистики пользователей...");

		const stats = await getUserStats();
		displayStatsTable(stats);

		console.log("✅ Статистика успешно получена!");
	} catch (error) {
		console.error("❌ Ошибка при выполнении скрипта:", error);
		process.exit(1);
	} finally {
		// Закрываем подключение к базе данных
		await pool.end();
	}
}

// Запускаем скрипт только если он вызван напрямую
if (require.main === module) {
	main();
}

export { getUserStats, displayStatsTable };
