import { pool } from "../config/database";

export interface UserConversation {
	id: string;
	user_id: string;
	conversation_id: string;
	created_at: Date;
	updated_at: Date;
}

export class UserConversationModel {
	/**
	 * Получить conversation ID для пользователя
	 */
	async getByUserId(userId: string): Promise<UserConversation | null> {
		try {
			const query = "SELECT * FROM user_conversations WHERE user_id = $1";
			const result = await pool.query(query, [userId]);
			return result.rows[0] || null;
		} catch (error) {
			console.error("Error in getByUserId:", error);
			throw error;
		}
	}

	/**
	 * Создать новую связь пользователь-conversation
	 */
	async create(userId: string, conversationId: string): Promise<UserConversation> {
		try {
			const query = `
                INSERT INTO user_conversations (user_id, conversation_id)
                VALUES ($1, $2)
                RETURNING *
            `;
			const values = [userId, conversationId];
			const result = await pool.query(query, values);
			return result.rows[0];
		} catch (error) {
			console.error("Error in create:", error);
			throw error;
		}
	}

	/**
	 * Обновить conversation ID для пользователя
	 */
	async updateConversationId(userId: string, conversationId: string): Promise<UserConversation> {
		try {
			const query = `
                UPDATE user_conversations 
                SET conversation_id = $2, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1
                RETURNING *
            `;
			const values = [userId, conversationId];
			const result = await pool.query(query, values);
			return result.rows[0];
		} catch (error) {
			console.error("Error in updateConversationId:", error);
			throw error;
		}
	}

	/**
	 * Удалить связь пользователь-conversation
	 */
	async deleteByUserId(userId: string): Promise<boolean> {
		try {
			const query = "DELETE FROM user_conversations WHERE user_id = $1";
			const result = await pool.query(query, [userId]);
			return result.rowCount !== null && result.rowCount > 0;
		} catch (error) {
			console.error("Error in deleteByUserId:", error);
			throw error;
		}
	}
}
