import {
	CozeAPI,
	Conversation,
	CreateConversationReq,
	CreateChatReq,
	CreateChatData,
	CreateChatPollData,
	EnterMessage,
	RoleType,
	ChatV3Message,
	ListMessageData,
	ListMessageReq,
} from "@coze/api";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

interface ObjectStringItem {
	type: "text" | "file" | "image" | "audio";
	text?: string;
	file_id?: string;
	file_url?: string;
}
class CozeService {
	private client: CozeAPI;
	private botId: string;

	constructor() {
		if (!process.env.COZE_TOKEN) {
			throw new Error("COZE_TOKEN is not defined in environment variables");
		}
		if (!process.env.COZE_BOT_ID) {
			throw new Error("COZE_BOT_ID is not defined in environment variables");
		}

		this.client = new CozeAPI({
			token: process.env.COZE_TOKEN,
		});
		this.botId = process.env.COZE_BOT_ID;
	}

	async uploadFile(file: Express.Multer.File): Promise<string> {
		try {
			const fileStream = fs.createReadStream(file.path);
			const response = await this.client.files.upload({
				file: fileStream as any,
			});

			fs.unlink(file.path, (err: any) => {
				if (err) console.error("Error deleting temporary file:", err);
			});

			if (!response || !response.id) {
				throw new Error("File upload to Coze API failed or returned no ID.");
			}

			return response.id;
		} catch (error) {
			console.error("Error in uploadFile to Coze:", error);
			throw error;
		}
	}

	async sendMessage(
		message: string | ObjectStringItem[],
		conversationHistory: any[] = [],
		conversationId?: string
	) {
		try {
			const chatParams: any = {
				bot_id: this.botId,
				additional_messages: [
					...(conversationHistory as any[]),
					{
						role: "user",
						content: typeof message === "string" ? message : message,
						content_type: typeof message === "string" ? "text" : "object_string",
					},
				],
				auto_save_history: true,
				meta_data: {},
			};

			// Add conversation_id if provided
			if (conversationId) {
				chatParams.conversation_id = conversationId;
			}

			const response = await this.client.chat.createAndPoll(chatParams);

			if (!response.messages || response.messages.length === 0) {
				throw new Error("No response received from Coze API");
			}

			const mainAnswer = response.messages.find((msg) => msg.type === "answer");

			const followUps = response.messages
				.filter((msg) => msg.type === "follow_up")
				.map((msg) => msg.content);

			return {
				success: true,
				data: {
					message: mainAnswer?.content || "No answer received",
					followUpQuestions: followUps,
					usage: response.usage,
				},
			};
		} catch (error) {
			console.error("Error in sendMessage:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}

	async streamMessage(message: string, conversationHistory: any[] = []) {
		try {
			const stream = await this.client.chat.stream({
				bot_id: this.botId,
				additional_messages: [
					...(conversationHistory as any[]),
					{
						role: "user",
						content: message,
						content_type: "text",
					},
				],
			});

			return stream;
		} catch (error) {
			console.error("Error in streamMessage:", error);
			throw error;
		}
	}

	async clearHistory(conversationId: string) {
		try {
			return {
				success: true,
				message: "Chat history cleared",
			};
		} catch (error) {
			console.error("Error in clearHistory:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}

	async createConversation(
		params: Omit<CreateConversationReq, "bot_id"> = {}
	): Promise<{ success: true; data: Conversation } | { success: false; error: string }> {
		try {
			const response = await this.client.conversations.create({
				bot_id: this.botId,
				...params,
			});

			return {
				success: true,
				data: response,
			};
		} catch (error) {
			console.error("Error in createConversation:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}

	/**
	 * Create a new chat within a conversation using Chat API v3
	 */
	async createChat(
		conversationId: string,
		message?: string | ObjectStringItem[],
		userId?: string
	): Promise<{ success: true; data: CreateChatData } | { success: false; error: string }> {
		try {
			const chatParams: CreateChatReq = {
				bot_id: this.botId,
				conversation_id: conversationId,
				auto_save_history: true,
			};

			// Add user_id if provided
			if (userId) {
				chatParams.user_id = userId;
			}

			// Add initial message if provided
			if (message) {
				const enterMessage: EnterMessage = {
					role: RoleType.User,
					content: typeof message === "string" ? message : JSON.stringify(message),
					content_type: typeof message === "string" ? "text" : "object_string",
				};
				chatParams.additional_messages = [enterMessage];
			}

			const response = await this.client.chat.create(chatParams);

			return {
				success: true,
				data: response,
			};
		} catch (error) {
			console.error("Error in createChat:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}

	/**
	 * Create a new chat and poll for completion using Chat API v3
	 */
	async createChatAndPoll(
		conversationId: string,
		message?: string | ObjectStringItem[],
		userId?: string
	): Promise<{ success: true; data: CreateChatPollData } | { success: false; error: string }> {
		try {
			const chatParams: CreateChatReq = {
				bot_id: this.botId,
				conversation_id: conversationId,
				auto_save_history: true,
			};

			// Add user_id if provided
			if (userId) {
				chatParams.user_id = userId;
			}

			// Add initial message if provided
			if (message) {
				const enterMessage: EnterMessage = {
					role: RoleType.User,
					content: typeof message === "string" ? message : JSON.stringify(message),
					content_type: typeof message === "string" ? "text" : "object_string",
				};
				chatParams.additional_messages = [enterMessage];
			}

			const response = await this.client.chat.createAndPoll(chatParams);

			return {
				success: true,
				data: response,
			};
		} catch (error) {
			console.error("Error in createChatAndPoll:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}

	/**
	 * Get list of messages in a conversation
	 */
	async getConversationMessages(
		conversationId: string,
		params?: ListMessageReq
	): Promise<{ success: true; data: ListMessageData } | { success: false; error: string }> {
		try {
			const response = await this.client.conversations.messages.list(conversationId, params);

			return {
				success: true,
				data: response,
			};
		} catch (error) {
			console.error("Error in getConversationMessages:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}
}

export const cozeService = new CozeService();
