/**
 * API функции для работы с conversation пользователей
 */

import { authService } from "./auth";

/**
 * Обработчик ошибок API с проверкой необходимости редиректа
 */
const handleApiError = async (response: Response): Promise<never> => {
	const errorData = await response.json().catch(() => ({}));

	// Проверяем, нужно ли перенаправить на страницу подписки
	if (response.status === 403 && errorData.redirectTo === "/access") {
		window.location.href = "/access";
		throw new Error("Subscription required - redirecting to access page");
	}

	throw new Error(`HTTP error! status: ${response.status}`);
};

export interface ConversationData {
	conversationId: string | null;
	hasExistingConversation?: boolean;
	isNew?: boolean;
}

export interface ConversationResponse {
	success: boolean;
	data?: ConversationData;
	error?: string;
}

export interface ChatData {
	chatId: string;
	conversationId: string;
	status: string;
	createdAt?: number;
	message?: string;
	followUpQuestions?: string[];
	usage?: any;
	chat?: any;
	messages?: any[];
}

export interface ChatResponse {
	success: boolean;
	data?: ChatData;
	error?: string;
}

export interface ConversationMessage {
	id: string;
	conversation_id: string;
	bot_id: string;
	chat_id: string;
	meta_data: any;
	role: "user" | "assistant";
	content: string;
	content_type: "text" | "object_string" | "card";
	type:
		| "question"
		| "answer"
		| "function_call"
		| "tool_output"
		| "tool_response"
		| "follow_up"
		| "verbose";
	created_at: number;
	updated_at: number;
}

export interface ConversationMessagesData {
	data: ConversationMessage[];
	first_id: string;
	last_id: string;
	has_more: boolean;
}

export interface ConversationMessagesResponse {
	success: boolean;
	data?: ConversationMessagesData;
	error?: string;
}

/**
 * Получить conversation ID для текущего пользователя
 */
export const getUserConversation = async (): Promise<ConversationResponse> => {
	try {
		const authHeaders = authService.getAuthHeader();
		const response = await fetch("/api/conversation/get", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				...(authHeaders.Authorization ? authHeaders : {}),
			},
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error("Error getting user conversation:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

/**
 * Создать новый conversation для пользователя
 */
export const createUserConversation = async (): Promise<ConversationResponse> => {
	try {
		const authHeaders = authService.getAuthHeader();
		const response = await fetch("/api/conversation/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(authHeaders.Authorization ? authHeaders : {}),
			},
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error("Error creating user conversation:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

/**
 * Сбросить conversation пользователя (создать новый)
 */
export const resetUserConversation = async (): Promise<ConversationResponse> => {
	try {
		const authHeaders = authService.getAuthHeader();
		const response = await fetch("/api/conversation/reset", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(authHeaders.Authorization ? authHeaders : {}),
			},
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error("Error resetting user conversation:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

/**
 * Создать новый чат в рамках conversation
 */
export const createChat = async (
	conversationId: string,
	message?: string
): Promise<ChatResponse> => {
	try {
		const authHeaders = authService.getAuthHeader();
		const response = await fetch("/api/conversation/chat/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(authHeaders.Authorization ? authHeaders : {}),
			},
			body: JSON.stringify({
				conversationId,
				message,
			}),
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error("Error creating chat:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

/**
 * Создать новый чат и ждать завершения
 */
export const createChatAndPoll = async (
	conversationId: string,
	message?: string | any[]
): Promise<ChatResponse> => {
	try {
		const authHeaders = authService.getAuthHeader();
		const response = await fetch("/api/conversation/chat/create-and-poll", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(authHeaders.Authorization ? authHeaders : {}),
			},
			body: JSON.stringify({
				conversationId,
				message,
			}),
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error("Error creating chat and polling:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

/**
 * Получить историю сообщений conversation
 */
export const getConversationMessages = async (
	limit?: number,
	order?: "asc" | "desc",
	beforeId?: string,
	afterId?: string
): Promise<ConversationMessagesResponse> => {
	try {
		const authHeaders = authService.getAuthHeader();
		const params = new URLSearchParams();

		if (limit) params.append("limit", limit.toString());
		if (order) params.append("order", order);
		if (beforeId) params.append("before_id", beforeId);
		if (afterId) params.append("after_id", afterId);

		const url = `/api/conversation/messages/get${params.toString() ? `?${params.toString()}` : ""}`;

		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				...(authHeaders.Authorization ? authHeaders : {}),
			},
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error("Error getting conversation messages:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};
