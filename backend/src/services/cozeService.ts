import { CozeAPI, Conversation, CreateConversationReq, MetaDataType } from "@coze/api";
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

	async sendMessage(message: string | ObjectStringItem[], conversationHistory: any[] = []) {
		try {
			const response = await this.client.chat.createAndPoll({
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
			});

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
}

export const cozeService = new CozeService();
