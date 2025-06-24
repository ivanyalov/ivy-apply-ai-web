import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'ivy_apply_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
};

export const pool = new Pool(dbConfig);

// Test database connection
pool.connect()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection error:', err)); 