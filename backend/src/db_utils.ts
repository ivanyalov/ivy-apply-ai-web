// This file will contain utilities for interacting with the Supabase database using TypeScript.
// Placeholder for Supabase client initialization and query functions.

import { pool } from './config/database';

/**
 * Инициализация базы данных - создание необходимых таблиц
 * Использует CREATE TABLE IF NOT EXISTS, поэтому существующие данные сохраняются
 */
export async function initializeDatabase() {
    try {
        console.log('Checking database schema...');

        // Создание таблицы пользователей (если не существует)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Users table ready');

        // Создание таблицы подписок (если не существует)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS subscriptions (
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
        console.log('✓ Subscriptions table ready');

        // Создание таблицы платежей (если не существует)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS payments (
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
        console.log('✓ Payments table ready');

        // Создание индексов для оптимизации (если не существуют)
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
            CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
            CREATE INDEX IF NOT EXISTS idx_subscriptions_cloudpayments_id ON subscriptions(cloudpayments_subscription_id);
            CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
            CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
            CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(cloudpayments_invoice_id);
        `);
        console.log('✓ Database indexes ready');

        // Миграция: переименование end_date в expires_at (если нужно)
        try {
            await pool.query(`
                ALTER TABLE subscriptions 
                RENAME COLUMN end_date TO expires_at
            `);
            console.log('✓ Migrated end_date to expires_at');
        } catch (error) {
            // Колонка уже переименована или не существует
            console.log('ℹ️ expires_at column already exists or migration not needed');
        }

        // Добавление новых полей для CloudPayments (если не существуют)
        try {
            await pool.query(`
                ALTER TABLE subscriptions 
                ADD COLUMN IF NOT EXISTS cloudpayments_subscription_id VARCHAR(255),
                ADD COLUMN IF NOT EXISTS cloudpayments_token VARCHAR(500),
                ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP
            `);
            console.log('✓ Added CloudPayments fields to subscriptions table');
        } catch (error) {
            console.log('ℹ️ CloudPayments fields already exist or migration not needed');
        }

        console.log('Database schema is ready - all existing data preserved');
    } catch (error) {
        console.error('Database schema initialization failed:', error);
        throw error;
    }
}

/**
 * Проверка подключения к базе данных
 */
export async function testDatabaseConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✓ Database connection successful');
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error);
        return false;
    }
}

export const placeholderDbFunction = async (): Promise<void> => {
  console.log('Placeholder DB function called');
};
