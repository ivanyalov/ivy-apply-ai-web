import { initializeDatabase, testDatabaseConnection } from './db_utils';

/**
 * Скрипт для первоначальной настройки базы данных
 * Запускайте этот скрипт только один раз при первом развертывании
 */
async function setupDatabase() {
    try {
        console.log('🚀 Starting database setup...');
        
        // Проверяем подключение
        const isConnected = await testDatabaseConnection();
        if (!isConnected) {
            console.error('❌ Cannot connect to database. Please check your configuration.');
            process.exit(1);
        }
        
        // Инициализируем схему БД
        await initializeDatabase();
        
        console.log('✅ Database setup completed successfully!');
        console.log('📝 You can now start the server with: npm run dev');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

// Запускаем настройку только если скрипт вызван напрямую
if (require.main === module) {
    setupDatabase();
} 