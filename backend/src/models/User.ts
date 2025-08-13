import bcrypt from "bcrypt";
import { pool } from "../config/database";

export interface User {
	id: string;
	email: string;
	password_hash: string;
	email_verified: boolean;
	verification_token: string | null;
	trial_used: boolean;
	created_at: Date;
	updated_at: Date;
}

export class UserModel {
	async create(email: string, password: string, verificationToken?: string): Promise<User> {
		console.log("🔍 UserModel.create called for email:", email);

		try {
			const password_hash = await bcrypt.hash(password, 10);
			console.log("✅ Password hashed successfully");

			const query = `
                INSERT INTO users (email, password_hash, email_verified, verification_token, trial_used)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;

			const values = [email, password_hash, false, verificationToken || null, false];
			const result = await pool.query(query, values);
			console.log("✅ Database query executed successfully");
			console.log("✅ User created in database:", {
				id: result.rows[0].id,
				email: result.rows[0].email,
			});

			return result.rows[0];
		} catch (error) {
			console.error("❌ UserModel.create error:", error);
			throw error;
		}
	}

	async findByEmail(email: string): Promise<User | null> {
		const query = "SELECT * FROM users WHERE email = $1";
		const result = await pool.query(query, [email]);
		return result.rows[0] || null;
	}

	async findById(id: string): Promise<User | null> {
		const query = "SELECT * FROM users WHERE id = $1";
		const result = await pool.query(query, [id]);
		return result.rows[0] || null;
	}

	async verifyPassword(user: User, password: string): Promise<boolean> {
		return bcrypt.compare(password, user.password_hash);
	}

	async findByVerificationToken(token: string): Promise<User | null> {
		const query = "SELECT * FROM users WHERE verification_token = $1";
		const result = await pool.query(query, [token]);
		return result.rows[0] || null;
	}

	async verifyEmail(userId: string): Promise<void> {
		const query = "UPDATE users SET email_verified = true, verification_token = null WHERE id = $1";
		await pool.query(query, [userId]);
	}

	async updateVerificationToken(userId: string, token: string): Promise<void> {
		const query = "UPDATE users SET verification_token = $1 WHERE id = $2";
		await pool.query(query, [token, userId]);
	}

	async markTrialUsed(userId: string): Promise<void> {
		const query = "UPDATE users SET trial_used = true WHERE id = $1";
		await pool.query(query, [userId]);
	}
}
