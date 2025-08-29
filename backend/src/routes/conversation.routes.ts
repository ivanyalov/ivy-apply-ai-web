import express, { Request, Response, NextFunction } from "express";
import { UserConversationModel } from "../models/UserConversation";
import { cozeService } from "../services/cozeService";
import { authMiddleware } from "../middleware/auth";
import { subscriptionMiddleware } from "../middleware/subscription";

const router = express.Router();
const userConversationModel = new UserConversationModel();

/**
 * Получить conversation ID для текущего пользователя
 * GET /api/conversation/get
 */
router.get(
	"/get",
	authMiddleware,
	subscriptionMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = (req as any).user?.userId;
			if (!userId) {
				return res.status(401).json({ error: "User not authenticated" });
			}

			const userConversation = await userConversationModel.getByUserId(userId);

			if (userConversation) {
				res.json({
					success: true,
					data: {
						conversationId: userConversation.conversation_id,
						hasExistingConversation: true,
					},
				});
			} else {
				res.json({
					success: true,
					data: {
						conversationId: null,
						hasExistingConversation: false,
					},
				});
			}
		} catch (error) {
			console.error("Error getting user conversation:", error);
			next(error);
		}
	}
);

/**
 * Создать новый conversation для пользователя
 * POST /api/conversation/create
 */
router.post(
	"/create",
	authMiddleware,
	subscriptionMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = (req as any).user?.userId;
			if (!userId) {
				return res.status(401).json({ error: "User not authenticated" });
			}

			// Проверяем, есть ли уже conversation у пользователя
			const existingConversation = await userConversationModel.getByUserId(userId);

			if (existingConversation) {
				return res.json({
					success: true,
					data: {
						conversationId: existingConversation.conversation_id,
						isNew: false,
					},
				});
			}

			// Создаем новый conversation через Coze API
			const cozeResponse = await cozeService.createConversation();

			if (!cozeResponse.success) {
				return res.status(500).json({
					success: false,
					error: cozeResponse.error,
				});
			}

			const conversationId = cozeResponse.data.id;

			// Сохраняем связь в базе данных
			await userConversationModel.create(userId, conversationId);

			res.json({
				success: true,
				data: {
					conversationId: conversationId,
					isNew: true,
				},
			});
		} catch (error) {
			console.error("Error creating user conversation:", error);
			next(error);
		}
	}
);

/**
 * Очистить conversation пользователя (создать новый)
 * POST /api/conversation/reset
 */
router.post(
	"/reset",
	authMiddleware,
	subscriptionMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = (req as any).user?.userId;
			if (!userId) {
				return res.status(401).json({ error: "User not authenticated" });
			}

			// Создаем новый conversation через Coze API
			const cozeResponse = await cozeService.createConversation();

			if (!cozeResponse.success) {
				return res.status(500).json({
					success: false,
					error: cozeResponse.error,
				});
			}

			const conversationId = cozeResponse.data.id;

			// Проверяем, есть ли существующая запись
			const existingConversation = await userConversationModel.getByUserId(userId);

			if (existingConversation) {
				// Обновляем существующую запись
				await userConversationModel.updateConversationId(userId, conversationId);
			} else {
				// Создаем новую запись
				await userConversationModel.create(userId, conversationId);
			}

			res.json({
				success: true,
				data: {
					conversationId: conversationId,
					isNew: true,
				},
			});
		} catch (error) {
			console.error("Error resetting user conversation:", error);
			next(error);
		}
	}
);

/**
 * Создать новый чат в рамках conversation пользователя
 * POST /api/conversation/chat/create
 */
router.post(
	"/chat/create",
	authMiddleware,
	subscriptionMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = (req as any).user?.userId;
			if (!userId) {
				return res.status(401).json({ error: "User not authenticated" });
			}

			const { message, conversationId } = req.body;

			// Validate conversationId
			if (!conversationId) {
				return res.status(400).json({
					success: false,
					error: "conversationId is required",
				});
			}

			// Verify that conversation belongs to user
			const userConversation = await userConversationModel.getByUserId(userId);
			if (!userConversation || userConversation.conversation_id !== conversationId) {
				return res.status(403).json({
					success: false,
					error: "Access denied to this conversation",
				});
			}

			// Create new chat using Chat API v3
			const chatResponse = await cozeService.createChat(conversationId, message, userId);

			if (!chatResponse.success) {
				return res.status(500).json({
					success: false,
					error: chatResponse.error,
				});
			}

			res.json({
				success: true,
				data: {
					chatId: chatResponse.data.id,
					conversationId: conversationId,
					status: chatResponse.data.status,
					createdAt: chatResponse.data.created_at,
					chat: chatResponse.data,
				},
			});
		} catch (error) {
			console.error("Error creating chat:", error);
			next(error);
		}
	}
);

/**
 * Создать новый чат и ждать завершения в рамках conversation пользователя
 * POST /api/conversation/chat/create-and-poll
 */
router.post(
	"/chat/create-and-poll",
	authMiddleware,
	subscriptionMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = (req as any).user?.userId;
			if (!userId) {
				return res.status(401).json({ error: "User not authenticated" });
			}

			const { message, conversationId } = req.body;

			// Validate conversationId
			if (!conversationId) {
				return res.status(400).json({
					success: false,
					error: "conversationId is required",
				});
			}

			// Verify that conversation belongs to user
			const userConversation = await userConversationModel.getByUserId(userId);
			if (!userConversation || userConversation.conversation_id !== conversationId) {
				return res.status(403).json({
					success: false,
					error: "Access denied to this conversation",
				});
			}

			// Create new chat and poll for completion using Chat API v3
			const chatResponse = await cozeService.createChatAndPoll(conversationId, message, userId);

			if (!chatResponse.success) {
				return res.status(500).json({
					success: false,
					error: chatResponse.error,
				});
			}

			// Extract main answer and follow-up questions from messages
			const mainAnswer = chatResponse.data.messages?.find((msg) => msg.type === "answer");
			const followUps =
				chatResponse.data.messages
					?.filter((msg) => msg.type === "follow_up")
					?.map((msg) => msg.content) || [];

			res.json({
				success: true,
				data: {
					chatId: chatResponse.data.chat.id,
					conversationId: conversationId,
					status: chatResponse.data.chat.status,
					message: mainAnswer?.content || "No answer received",
					followUpQuestions: followUps,
					usage: chatResponse.data.usage,
					chat: chatResponse.data.chat,
					messages: chatResponse.data.messages,
				},
			});
		} catch (error) {
			console.error("Error creating chat and polling:", error);
			next(error);
		}
	}
);

/**
 * Получить историю сообщений conversation пользователя
 * GET /api/conversation/messages/get
 */
router.get(
	"/messages/get",
	authMiddleware,
	subscriptionMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = (req as any).user?.userId;
			if (!userId) {
				return res.status(401).json({ error: "User not authenticated" });
			}

			const { limit, order, before_id, after_id } = req.query;

			// Get user's conversation
			const userConversation = await userConversationModel.getByUserId(userId);
			if (!userConversation) {
				return res.json({
					success: true,
					data: {
						data: [],
						first_id: "",
						last_id: "",
						has_more: false,
					},
				});
			}

			const conversationId = userConversation.conversation_id;

			// Prepare parameters for Coze API
			const params: any = {};
			if (limit) params.limit = parseInt(limit as string);
			if (order) params.order = order as "asc" | "desc";
			if (before_id) params.before_id = before_id as string;
			if (after_id) params.after_id = after_id as string;

			// Get messages from Coze API
			const messagesResponse = await cozeService.getConversationMessages(conversationId, params);

			if (!messagesResponse.success) {
				return res.status(500).json({
					success: false,
					error: messagesResponse.error,
				});
			}

			res.json({
				success: true,
				data: messagesResponse.data,
			});
		} catch (error) {
			console.error("Error getting conversation messages:", error);
			next(error);
		}
	}
);

export default router;
