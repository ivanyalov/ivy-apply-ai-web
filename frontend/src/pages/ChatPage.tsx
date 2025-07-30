import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import HomeButton from "../shared/components/HomeButton";
import {
	getUserConversation,
	createUserConversation,
	resetUserConversation,
	createChatAndPoll,
	getConversationMessages,
} from "../shared/api/conversation";

/**
 * @interface Message
 * @description Представляет сообщение в чате между пользователем и AI-помощником.
 * @property {number} id - Уникальный идентификатор сообщения.
 * @property {string} text - Текст сообщения.
 * @property {boolean} isUser - Флаг, указывающий, является ли сообщение пользовательским.
 * @property {Date} timestamp - Временная метка сообщения.
 * @property {string[]} [followUpQuestions] - Дополнительные вопросы от AI для продолжения диалога.
 * @property {string} [fileName] - Название прикрепленного файла.
 * @property {number} [fileSize] - Размер прикрепленного файла в байтах.
 * @property {string} [fileType] - MIME-тип прикрепленного файла.
 * @property {string} [fileUrl] - URL прикрепленного файла для скачивания.
 */
interface Message {
	id: number;
	text: string;
	isUser: boolean;
	timestamp: Date;
	followUpQuestions?: string[]; // Optional field for follow-up questions
	// Fields for attached file details (for display)
	fileName?: string;
	fileSize?: number;
	fileType?: string; // MIME type
	fileUrl?: string; // URL for file download
}

/**
 * @interface ConversationHistory
 * @description Представляет историю разговора для отправки в API.
 * @property {'user' | 'assistant'} role - Роль участника разговора.
 * @property {string} content - Содержимое сообщения.
 * @property {'text' | 'object_string'} content_type - Тип содержимого.
 */
interface ConversationHistory {
	role: "user" | "assistant";
	content: string;
	content_type: "text" | "object_string"; // Allow object_string for files
}

/**
 * @interface ObjectStringItem
 * @description Представляет элемент мультимодального сообщения (текст, файл, изображение, аудио).
 * @property {'text' | 'file' | 'image' | 'audio'} type - Тип содержимого.
 * @property {string} [text] - Текстовое содержимое.
 * @property {string | null} [file_id] - Идентификатор файла на сервере.
 * @property {string | null} [file_url] - URL файла.
 */
interface ObjectStringItem {
	type: "text" | "file" | "image" | "audio";
	text?: string;
	file_id?: string | null;
	file_url?: string | null;
}

/**
 * @type MessageContent
 * @description Массив элементов мультимодального сообщения.
 */
interface MessageContent extends Array<ObjectStringItem> {}

/**
 * @component ChatPage
 * @description Основная страница чата с AI-помощником по поступлению.
 * Позволяет пользователям общаться с AI, загружать документы и получать рекомендации.
 * Поддерживает мультимодальные сообщения (текст + файлы).
 *
 * @returns {JSX.Element} Интерфейс чата с историей сообщений, полем ввода и возможностью загрузки файлов.
 *
 * @example
 * ```tsx
 * <ChatPage />
 * ```
 */
const ChatPage: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: 1,
			text: "Привет! Я ваш AI-помощник по поступлению. Я могу помочь вам с эссе, выбором школы, руководством по подаче документов и ответить на любые вопросы о поступлении в университет. Чем я могу вам помочь сегодня?",
			isUser: false,
			timestamp: new Date(),
		},
	]);
	const [inputText, setInputText] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);
	const [streamingText, setStreamingText] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const nextMessageId = useRef(2);
	const [attachedFile, setAttachedFile] = useState<{ file: File; fileId: string | null } | null>(
		null
	);
	const initializationAttempted = useRef(false);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, streamingText]);

	// Initialize conversation when component mounts
	useEffect(() => {
		const initializeConversation = async () => {
			// Prevent duplicate initialization (React StrictMode calls effects twice)
			if (initializationAttempted.current) {
				return;
			}
			initializationAttempted.current = true;

			try {
				setIsInitializing(true);
				console.log("Starting conversation initialization...");

				// First, try to get existing conversation
				const existingConversation = await getUserConversation();

				if (existingConversation.success && existingConversation.data?.conversationId) {
					// User has existing conversation
					setConversationId(existingConversation.data.conversationId);
					console.log("Loaded existing conversation:", existingConversation.data.conversationId);

					// Load conversation history
					await loadConversationHistory();
				} else {
					// No existing conversation, create new one
					console.log("No existing conversation found, creating new one...");
					const newConversation = await createUserConversation();

					if (newConversation.success && newConversation.data?.conversationId) {
						setConversationId(newConversation.data.conversationId);
						console.log("Created new conversation:", newConversation.data.conversationId);
					} else {
						console.error("Failed to create conversation:", newConversation.error);
					}
				}
			} catch (error) {
				console.error("Error initializing conversation:", error);
			} finally {
				setIsInitializing(false);
			}
		};

		const loadConversationHistory = async () => {
			try {
				console.log("Loading conversation history...");

				// Get messages from conversation (recent first)
				const messagesResponse = await getConversationMessages(50, "desc");

				if (messagesResponse.success && messagesResponse.data?.data) {
					const cozeMessages = messagesResponse.data.data;
					console.log(`Loaded ${cozeMessages.length} messages from conversation`);

					// Helper function to parse object_string content
					const parseObjectStringContent = (content: string, contentType: string) => {
						if (contentType === "object_string") {
							try {
								const parsed = JSON.parse(content);
								if (Array.isArray(parsed)) {
									const textItems = parsed.filter((item) => item.type === "text");
									const fileItems = parsed.filter(
										(item) => item.type === "file" || item.type === "image" || item.type === "audio"
									);

									const text = textItems
										.map((item) => item.text)
										.join(" ")
										.trim();
									const firstFile = fileItems[0];

									return {
										text: text || "",
										fileName: firstFile?.file_url
											? extractFileNameFromUrl(firstFile.file_url)
											: undefined,
										fileSize: undefined, // Not available in object_string
										fileType: firstFile ? `${firstFile.type}/unknown` : undefined,
										fileUrl: firstFile?.file_url,
									};
								}
							} catch (error) {
								console.warn("Failed to parse object_string content:", error);
							}
						}

						return {
							text: content,
							fileName: undefined,
							fileSize: undefined,
							fileType: undefined,
							fileUrl: undefined,
						};
					};

					// Helper function to extract filename from URL
					const extractFileNameFromUrl = (url: string) => {
						try {
							const urlParts = url.split("/");
							let fileName = urlParts[urlParts.length - 1];

							// Remove query parameters if present
							if (fileName.includes("?")) {
								fileName = fileName.split("?")[0];
							}

							// Remove hash fragments if present
							if (fileName.includes("#")) {
								fileName = fileName.split("#")[0];
							}

							// Decode URL encoding
							fileName = decodeURIComponent(fileName);

							// If filename looks like a UUID or hash (long string without extension),
							// try to get meaningful name from earlier parts of URL
							if (fileName.length > 30 && !fileName.includes(".")) {
								// Check if there's a more meaningful filename in earlier URL parts
								for (let i = urlParts.length - 2; i >= 0; i--) {
									const part = urlParts[i];
									if (part && part.includes(".") && part.length < 50) {
										fileName = decodeURIComponent(part);
										break;
									}
								}
							}

							// If still no good filename, provide a default based on file type
							if (fileName.length > 50 || !fileName.includes(".")) {
								return "Прикрепленный файл";
							}

							return fileName;
						} catch (error) {
							console.warn("Failed to extract filename from URL:", error);
						}
						return "Прикрепленный файл";
					};

					// Convert Coze messages to our Message format
					const convertedMessages = cozeMessages
						.filter((msg) => msg.type === "question" || msg.type === "answer") // Only show questions and answers
						.reverse() // Show oldest first (since we got desc order)
						.map((msg, index) => {
							const parsedContent = parseObjectStringContent(msg.content, msg.content_type);

							return {
								id: nextMessageId.current++,
								text: parsedContent.text,
								isUser: msg.role === "user",
								timestamp: new Date(msg.created_at * 1000), // Convert Unix timestamp to Date
								fileName: parsedContent.fileName,
								fileSize: parsedContent.fileSize,
								fileType: parsedContent.fileType,
								fileUrl: parsedContent.fileUrl,
							};
						});

					// Replace initial greeting with loaded messages if any exist
					if (convertedMessages.length > 0) {
						setMessages(convertedMessages);
						console.log("Conversation history loaded successfully");
					} else {
						console.log("No conversation history found, keeping initial greeting");
					}
				}
			} catch (error) {
				console.error("Error loading conversation history:", error);
				// Keep the initial greeting message if loading fails
			}
		};

		initializeConversation();
	}, []);

	// Note: getConversationHistory is no longer needed with Chat API v3
	// as it automatically maintains conversation history within the conversation

	const handleSendMessage = async (messageTextFromButton?: string) => {
		const textToSend = messageTextFromButton || inputText.trim();
		if (!textToSend && !attachedFile) return; // Prevent sending empty message with no file

		// Ensure conversation is initialized before sending message
		if (!conversationId) {
			console.warn("No conversation ID available, message not sent");
			return;
		}

		// Clear previous follow-up questions from all messages
		setMessages((prev) => prev.map((msg) => ({ ...msg, followUpQuestions: undefined })));

		// Clear attached file display immediately
		setAttachedFile(null);

		const userMessage: Message = {
			id: nextMessageId.current++,
			text: textToSend,
			isUser: true,
			timestamp: new Date(),
			// Add file details to the message object if a file is attached
			fileName: attachedFile?.file.name,
			fileSize: attachedFile?.file.size,
			fileType: attachedFile?.file.type,
		};

		setMessages((prev) => [...prev, userMessage]);

		// Clear input box immediately if sending from button, otherwise clear after adding user message
		if (!messageTextFromButton) {
			setInputText("");
		} else {
			setInputText(""); // Also clear input if sending via button click
		}

		setIsLoading(true);

		try {
			// Prepare message for Chat API v3
			let messageToSend: string | ObjectStringItem[];

			if (attachedFile) {
				// Construct multimodal message with text and file
				let messageContent: ObjectStringItem[] = [];

				if (textToSend) {
					messageContent.push({ type: "text", text: textToSend });
				}

				// Determine file type for Coze API
				let cozeFileType: "file" | "image" | "audio" = "file"; // Default to 'file'
				if (attachedFile.file.type.startsWith("image/")) {
					cozeFileType = "image";
				} else if (attachedFile.file.type.startsWith("audio/")) {
					cozeFileType = "audio";
				}
				messageContent.push({ type: cozeFileType, file_id: attachedFile.fileId });

				messageToSend = messageContent;
			} else {
				// Simple text message
				messageToSend = textToSend;
			}

			console.log("Sending message using Chat API v3...");

			// Use Chat API v3 to create chat and poll for completion
			const result = await createChatAndPoll(conversationId, messageToSend);

			if (result.success) {
				const aiMessage: Message = {
					id: nextMessageId.current++,
					text: result.data?.message || "No answer received", // Main answer
					followUpQuestions: result.data?.followUpQuestions, // Add follow-up questions
					isUser: false,
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, aiMessage]);

				console.log("Chat API v3 response:", {
					chatId: result.data?.chatId,
					status: result.data?.status,
					message: result.data?.message?.substring(0, 100) + "...",
				});
			} else {
				// Handle error case from backend
				const errorMessage: Message = {
					id: nextMessageId.current++,
					text: result.error || "An error occurred.",
					isUser: false,
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, errorMessage]);
			}

			setIsLoading(false);
		} catch (error) {
			console.error("Error sending message with Chat API v3:", error);
			setIsLoading(false);

			const errorMessage: Message = {
				id: nextMessageId.current++,
				text: "Извините, у меня сейчас проблемы с подключением. Пожалуйста, попробуйте еще раз через некоторое время.",
				isUser: false,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		}
	};

	const handleClearChat = async () => {
		try {
			setIsLoading(true);

			// Reset conversation on the server (creates new one)
			const resetResult = await resetUserConversation();

			if (resetResult.success && resetResult.data?.conversationId) {
				setConversationId(resetResult.data.conversationId);
				console.log("Reset to new conversation:", resetResult.data.conversationId);
			} else {
				console.error("Failed to reset conversation:", resetResult.error);
			}

			// Clear local messages
			setMessages([
				{
					id: 1,
					text: "Чат очищен! Я готов помочь вам с вашими вопросами по поступлению в университет.",
					isUser: false,
					timestamp: new Date(),
				},
			]);
			setAttachedFile(null); // Also clear attached file when clearing chat
		} catch (error) {
			console.error("Error clearing chat:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage(); // Call with no arguments to use inputText
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			console.log("Selected file:", file);
			setIsLoading(true); // Indicate loading while uploading file

			const formData = new FormData();
			formData.append("file", file);

			// Send file to the backend upload endpoint
			fetch("/api/chat/upload", {
				method: "POST",
				body: formData,
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.success && data.fileId) {
						console.log("File uploaded, received ID:", data.fileId);
						setAttachedFile({ file, fileId: data.fileId }); // Save the received file and its ID
						// No alert needed, file name will be displayed
					} else {
						console.error("File upload failed:", data.error);
						alert("Ошибка загрузки файла.");
					}
				})
				.catch((error) => {
					console.error("Error during file upload fetch:", error);
					alert("Ошибка при загрузке файла.");
				})
				.finally(() => {
					setIsLoading(false); // End loading indicator
					e.target.value = ""; // Clear the input so the same file can be selected again
				});
		}
	};

	return (
		<div className="h-screen flex flex-col bg-white">
			{/* Header */}
			<div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
				<HomeButton />
			</div>

			{/* Messages Container */}
			<div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
				{isInitializing && (
					<div className="flex justify-center items-center h-full">
						<div className="bg-gray-100 text-gray-900 px-6 py-4 rounded-lg">
							<div className="flex items-center space-x-3">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-harvard-crimson"></div>
								<span>Инициализация чата...</span>
							</div>
						</div>
					</div>
				)}
				{!isInitializing &&
					messages.map((message) => (
						<div
							key={message.id}
							className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-3xl px-4 py-3 rounded-lg ${
									message.isUser ? "bg-harvard-crimson text-white" : "bg-gray-100 text-gray-900"
								}`}
							>
								{message.isUser ? (
									// Render user message
									<div className="space-y-2">
										{/* Render text if present */}
										{message.text && message.text.trim() && (
											<p className="whitespace-pre-wrap">{message.text}</p>
										)}

										{/* Render attached file if present */}
										{message.fileName && (
											<div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg p-2">
												{/* File icon */}
												<div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white text-gray-900 rounded">
													<span className="text-xs font-bold">
														{message.fileType?.split("/")[1]?.toUpperCase().substring(0, 3) ||
															"FILE"}
													</span>
												</div>
												<div className="flex-1">
													{message.fileUrl ? (
														<a
															href={message.fileUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="font-medium text-white text-sm hover:text-blue-100 underline"
														>
															{message.fileName}
														</a>
													) : (
														<p className="font-medium text-white text-sm">{message.fileName}</p>
													)}
													{message.fileSize !== undefined && (
														<p className="text-xs text-blue-100">
															{(message.fileSize / 1024).toFixed(2)} KB
														</p>
													)}
												</div>
												{message.fileUrl && (
													<div className="flex-shrink-0">
														<a
															href={message.fileUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="text-white hover:text-blue-100 transition-colors"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
																/>
															</svg>
														</a>
													</div>
												)}
											</div>
										)}
									</div>
								) : (
									// Render bot message (Markdown)
									<ReactMarkdown
										remarkPlugins={[remarkGfm]}
										components={{
											p: ({ node, ...props }) => (
												<p className="whitespace-pre-wrap mb-4" {...props} />
											),
											a: ({ node, ...props }) => (
												<a
													className="text-blue-600 hover:underline"
													target="_blank"
													rel="noopener noreferrer"
													{...props}
												/>
											),
										}}
									>
										{message.text}
									</ReactMarkdown>
								)}
								<p className={`text-xs mt-1 ${message.isUser ? "text-red-100" : "text-gray-500"}`}>
									{message.timestamp.toLocaleTimeString()}
								</p>
							</div>
						</div>
					))}

				{/* Render follow-up questions as buttons */}
				{!isInitializing &&
					messages.map(
						(message) =>
							!message.isUser &&
							message.followUpQuestions &&
							message.followUpQuestions.length > 0 && (
								<div key={`follow-ups-${message.id}`} className="flex justify-start mt-2">
									<div className="flex flex-wrap gap-2">
										{message.followUpQuestions.map((question, index) => (
											<button
												key={`follow-up-${message.id}-${index}`}
												onClick={() => handleSendMessage(question)}
												className="bg-white border border-gray-300 text-gray-900 px-3 py-1.5 rounded-md text-base font-normal hover:bg-gray-100 transition-colors"
											>
												{question}
											</button>
										))}
									</div>
								</div>
							)
					)}

				{!isInitializing && isLoading && !streamingText && (
					<div className="flex justify-start">
						<div className="bg-gray-100 text-gray-900 max-w-3xl px-4 py-3 rounded-lg">
							<div className="flex items-center space-x-2">
								<div className="animate-pulse flex space-x-1">
									<div className="w-2 h-2 bg-gray-400 rounded-full"></div>
									<div className="w-2 h-2 bg-gray-400 rounded-full"></div>
									<div className="w-2 h-2 bg-gray-400 rounded-full"></div>
								</div>
								<span className="text-sm">AI печатает...</span>
							</div>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input Area */}
			<div className="border-t border-gray-200 px-6 py-4">
				<div className="flex space-x-4">
					{/* Hidden file input */}
					<input type="file" id="file-upload" className="hidden" onChange={handleFileSelect} />
					{/* File upload button */}
					<label
						htmlFor="file-upload"
						className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
					>
						{/* Plus in circle icon (Material Icons) */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="w-7 h-7 text-gray-700"
						>
							<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
							<path
								d="M12 8v8M8 12h8"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							/>
						</svg>
					</label>
					<textarea
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Введите ваше сообщение..."
						className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-harvard-crimson focus:outline-none focus:ring-1 focus:ring-harvard-crimson"
						rows={1}
						disabled={isLoading}
					/>
					{attachedFile && (
						// Display attached file icon, name, and size
						<div className="flex items-center space-x-2 px-2 py-1 bg-gray-100 rounded-lg text-gray-800">
							{/* File icon */}
							<div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded">
								{/* Simple text icon based on extension or type */}
								<span className="text-xs font-bold">
									{attachedFile.file.name.split(".").pop()?.toUpperCase().substring(0, 3) ||
										attachedFile.file.type?.split("/")[1]?.toUpperCase().substring(0, 3) ||
										"ФАЙЛ"}
								</span>
							</div>
							<div>
								<p className="font-medium text-sm">{attachedFile.file.name}</p>
								{attachedFile.file.size !== undefined && (
									<p className="text-xs text-gray-600">
										{(attachedFile.file.size / 1024).toFixed(2)} KB
									</p>
								)}
							</div>
							{/* Button to remove the attached file */}
							<button
								onClick={() => setAttachedFile(null)}
								className="ml-1 text-gray-400 hover:text-gray-600 text-lg leading-none"
							>
								×
							</button>
						</div>
					)}
					<button
						onClick={() => handleSendMessage()}
						disabled={isLoading || (!inputText.trim() && !attachedFile)}
						className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors
              ${isLoading || (!inputText.trim() && !attachedFile) ? "" : "hover:bg-gray-200"}
            `}
						title="Отправить"
					>
						{/* Send (paper plane) icon */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className={`w-7 h-7 transition-colors
              ${
								isLoading || (!inputText.trim() && !attachedFile)
									? "text-gray-700"
									: "text-harvard-crimson"
							}
            `}
						>
							<polygon
								points="3 20 21 12 3 4 7 12 3 20"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinejoin="round"
								fill="none"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChatPage;
