import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { pool } from '../config/database';

export interface User {
    id: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

export class UserModel {
    async create(email: string, password: string): Promise<User> {
        const id = uuidv4();
        const password_hash = await bcrypt.hash(password, 10);
        
        const query = `
            INSERT INTO users (id, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        
        const values = [id, email, password_hash];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    async findById(id: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async verifyPassword(user: User, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.password_hash);
    }
} 