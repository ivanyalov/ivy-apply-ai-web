import { pool } from "./src/config/database";
import { updateSubscription } from "./src/models/Subscription";

async function updateExpiredSubscriptions() {
	try {
		console.log("🔄 Обновляем истекшие подписки...\n");

		// Получаем все активные подписки, которые истекли
		const expiredSubscriptionsResult = await pool.query(`
			SELECT 
				id, 
				user_id, 
				status, 
				plan_type, 
				expires_at,
				created_at
			FROM subscriptions 
			WHERE status = 'active' 
			AND expires_at IS NOT NULL 
			AND expires_at <= CURRENT_TIMESTAMP
			ORDER BY created_at DESC
		`);

		const expiredSubscriptions = expiredSubscriptionsResult.rows;

		if (expiredSubscriptions.length === 0) {
			console.log("✅ Истекших подписок не найдено");
			return;
		}

		console.log(`📋 Найдено ${expiredSubscriptions.length} истекших подписок:\n`);

		for (const subscription of expiredSubscriptions) {
			console.log(`🔄 Обновляем подписку ${subscription.id}:`);
			console.log(`   - Пользователь: ${subscription.user_id}`);
			console.log(`   - Тип: ${subscription.plan_type}`);
			console.log(`   - Истекла: ${subscription.expires_at}`);
			console.log(`   - Создана: ${subscription.created_at}`);

			// Обновляем статус на "unsubscribed"
			await updateSubscription(subscription.id, {
				status: "unsubscribed",
			});

			console.log(`   ✅ Статус обновлен на "unsubscribed"\n`);
		}

		console.log(`🎉 Обновление завершено! Обработано ${expiredSubscriptions.length} подписок`);
	} catch (error) {
		console.error("❌ Ошибка при обновлении подписок:", error);
	} finally {
		await pool.end();
	}
}

// Запускаем обновление
updateExpiredSubscriptions();
