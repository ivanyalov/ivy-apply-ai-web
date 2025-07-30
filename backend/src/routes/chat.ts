import express, { Request, Response, NextFunction } from "express";
import { cozeService } from "../services/cozeService";
import { ChatEventType } from "@coze/api";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Configure multer to save files to an 'uploads' directory

// File upload endpoint
// @ts-ignore - Temporarily ignore type error due to Multer/Express type incompatibility
router.post(
	"/upload",
	upload.single("file"),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const file = (req as any).file; // Use 'any' to bypass type error for req.file
			if (!file) {
				return res.status(400).json({ error: "No file uploaded" });
			}

			// Call CozeService to upload the file to Coze API
			const fileId = await cozeService.uploadFile(file);

			// Respond with the file ID
			res.json({ success: true, fileId });
		} catch (error) {
			console.error("Error uploading file:", error);
			next(error); // Pass error to the next middleware
		}
	}
);

// Regular message endpoint
router.post("/message", async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { message, conversationHistory } = req.body;
		const response = await cozeService.sendMessage(message, conversationHistory);
		res.json(response);
	} catch (error) {
		console.error("Error in /message endpoint:", error);
		next(error); // Pass error to the next middleware
	}
});

// Streaming endpoint
router.post("/stream", async (req: Request, res: Response) => {
	const { message, conversationHistory } = req.body;

	// Set headers for SSE
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");

	try {
		// Send start event
		res.write(`data: ${JSON.stringify({ type: "start" })}\n\n`);

		const stream = await cozeService.streamMessage(message, conversationHistory);

		for await (const chunk of stream) {
			if (chunk.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
				// Send delta event with content
				res.write(
					`data: ${JSON.stringify({
						type: "delta",
						content: chunk.data.content,
					})}\n\n`
				);
			} else if (chunk.event === ChatEventType.CONVERSATION_MESSAGE_COMPLETED) {
				// Send done event
				res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
			}
		}
	} catch (error) {
		console.error("Error in /stream endpoint:", error);
		// Send error event
		res.write(
			`data: ${JSON.stringify({
				type: "error",
				message: error instanceof Error ? error.message : "Unknown error occurred",
			})}\n\n`
		);
	} finally {
		res.end();
	}
});

// Endpoint to create a new conversation
router.post("/conversation/create", async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Only allowed fields
		const { meta_data, messages } = req.body;
		const result = await cozeService.createConversation({
			meta_data,
			messages,
		});
		res.json(result);
	} catch (error) {
		console.error("Error in /conversation/create endpoint:", error);
		next(error);
	}
});

export default router;
