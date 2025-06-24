import { pool } from './config/database';

/**
 * Скрипт для полного сброса базы данных
 * ВНИМАНИЕ: Этот скрипт удалит все данные!
 * Запускайте только в development окружении
 */
async function resetDatabase() {
    try {
        console.log('🚨 Starting database reset...');
        console.log('⚠️  WARNING: This will delete ALL data!');
        
        // Удаляем все таблицы в правильном порядке
        await pool.query('DROP TABLE IF EXISTS payments CASCADE');
        console.log('✓ Dropped payments table');
        
        await pool.query('DROP TABLE IF EXISTS subscriptions CASCADE');
        console.log('✓ Dropped subscriptions table');
        
        await pool.query('DROP TABLE IF EXISTS users CASCADE');
        console.log('✓ Dropped users table');
        
        // Создаем таблицы заново с новой схемой
        await pool.query(`
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Created users table');

        await pool.query(`
            CREATE TABLE subscriptions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                status VARCHAR(50) NOT NULL DEFAULT 'active',
                plan_type VARCHAR(50) NOT NULL DEFAULT 'trial',
                start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                cloudpayments_subscription_id VARCHAR(255),
                cloudpayments_token VARCHAR(500),
                cancelled_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Created subscriptions table');

        await pool.query(`
            CREATE TABLE payments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
                cloudpayments_invoice_id VARCHAR(255),
                cloudpayments_subscription_id VARCHAR(255),
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Created payments table');

        // Создаем индексы
        await pool.query(`
            CREATE INDEX idx_users_email ON users(email);
            CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
            CREATE INDEX idx_subscriptions_status ON subscriptions(status);
            CREATE INDEX idx_subscriptions_cloudpayments_id ON subscriptions(cloudpayments_subscription_id);
            CREATE INDEX idx_payments_user_id ON payments(user_id);
            CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
            CREATE INDEX idx_payments_invoice_id ON payments(cloudpayments_invoice_id);
        `);
        console.log('✓ Created database indexes');

        console.log('✅ Database reset completed successfully!');
        console.log('📝 Database is now ready for CloudPayments integration');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database reset failed:', error);
        process.exit(1);
    }
}

// Запускаем сброс только если скрипт вызван напрямую
if (require.main === module) {
    resetDatabase();
} 