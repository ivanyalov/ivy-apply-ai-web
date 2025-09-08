import { pool } from "./src/config/database";

async function testTrialUsedLogic() {
	try {
		console.log("🧪 Тестируем логику обновления trial_used...\n");

		// Находим пользователя с подпиской, но без trial_used = true
		const usersResult = await pool.query(`
			SELECT 
				u.id, 
				u.email,
				u.trial_used,
				s.status,
				s.plan_type,
				s.cloudpayments_subscription_id
			FROM users u
			LEFT JOIN subscriptions s ON u.id = s.user_id
			WHERE s.plan_type = 'premium' AND s.status = 'active'
			ORDER BY s.created_at DESC
			LIMIT 5
		`);

		console.log("📋 Пользователи с premium подписками:");
		usersResult.rows.forEach((user, index) => {
			console.log(`${index + 1}. ${user.email}:`);
			console.log(`   - trial_used: ${user.trial_used}`);
			console.log(`   - status: ${user.status}`);
			console.log(`   - plan_type: ${user.plan_type}`);
			console.log(`   - subscription_id: ${user.cloudpayments_subscription_id || "нет"}`);
		});

		// Выбираем первого пользователя для тестирования
		const testUser = usersResult.rows[0];
		if (!testUser) {
			console.log("❌ Нет пользователей с premium подписками для тестирования");
			return;
		}

		console.log(`\n👤 Тестируем с пользователем: ${testUser.email}`);
		console.log(`   - Текущий trial_used: ${testUser.trial_used}`);

		// Тестируем обновление trial_used
		console.log("\n🔄 Имитируем успешную подписку...");
		const updateResult = await pool.query(
			"UPDATE users SET trial_used = true WHERE id = $1 AND trial_used = false",
			[testUser.id]
		);

		console.log(`✅ Обновлено записей: ${updateResult.rowCount}`);

		if (updateResult.rowCount === 0) {
			console.log("ℹ️  Пользователь уже был отмечен как использовавший пробный период");
		} else {
			console.log("✅ Пользователь успешно отмечен как использовавший пробный период");
		}

		// Проверяем финальное состояние
		const finalResult = await pool.query("SELECT trial_used FROM users WHERE id = $1", [
			testUser.id,
		]);

		console.log(`\n📊 Финальное состояние:`);
		console.log(`   - trial_used: ${finalResult.rows[0].trial_used}`);

		console.log("\n✅ Тестирование завершено!");
	} catch (error) {
		console.error("❌ Ошибка при тестировании:", error);
	} finally {
		await pool.end();
	}
}

// Запускаем тест
testTrialUsedLogic();
