import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';

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
}

/**
 * @interface ConversationHistory
 * @description Представляет историю разговора для отправки в API.
 * @property {'user' | 'assistant'} role - Роль участника разговора.
 * @property {string} content - Содержимое сообщения.
 * @property {'text' | 'object_string'} content_type - Тип содержимого.
 */
interface ConversationHistory {
  role: 'user' | 'assistant';
  content: string;
  content_type: 'text' | 'object_string'; // Allow object_string for files
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
  type: 'text' | 'file' | 'image' | 'audio';
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
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(2);
  const [attachedFile, setAttachedFile] = useState<{ file: File, fileId: string | null } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const getConversationHistory = (): ConversationHistory[] => {
    return messages
      .filter(msg => msg.id !== 1) // Skip the initial greeting
      .map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
        content_type: 'text'
      }));
  };

  const handleSendMessage = async (messageTextFromButton?: string) => {
    const textToSend = messageTextFromButton || inputText.trim();
    if (!textToSend && !attachedFile) return; // Prevent sending empty message with no file

    // Clear previous follow-up questions from all messages
    setMessages(prev => prev.map(msg => ({ ...msg, followUpQuestions: undefined })));

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

    setMessages(prev => [...prev, userMessage]);

    // Clear input box immediately if sending from button, otherwise clear after adding user message
    if (!messageTextFromButton) {
      setInputText('');
    } else {
      setInputText(''); // Also clear input if sending via button click
    }

    setIsLoading(true);

    try {
      // Construct the content based on text and file ID
      let messageContent: ObjectStringItem[] = [];

      if (textToSend) {
        messageContent.push({ type: 'text', text: textToSend });
      }

      if (attachedFile) {
        // Assuming the uploaded file is an image or file type supported by Coze
        // We might need to determine the exact type (file, image, audio) based on the file extension or mime type.
        // For simplicity, let's assume it's a generic 'file' or 'image' for now.
        // A more robust implementation would check the file type.
        // Coze API supports 'file', 'image', 'audio'. We should map MIME types.
        let cozeFileType: 'file' | 'image' | 'audio' = 'file'; // Default to 'file'
        if (attachedFile.file.type.startsWith('image/')) {
          cozeFileType = 'image';
        } else if (attachedFile.file.type.startsWith('audio/')) {
          cozeFileType = 'audio';
        }
        messageContent.push({ type: cozeFileType, file_id: attachedFile.fileId });
      }

      if (messageContent.length === 0) {
         // Should not happen if textToSend or attachedFile is checked
         setIsLoading(false);
         return;
      }

      // Create a POST request to the message endpoint
      const response = await fetch('http://localhost:8000/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent.length === 1 && messageContent[0].type === 'text' ? textToSend : messageContent, // Send messageContent if multimodal
          conversationHistory: getConversationHistory()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const aiMessage: Message = {
          id: nextMessageId.current++,
          text: result.data.message, // Main answer
          followUpQuestions: result.data.followUpQuestions, // Add follow-up questions
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);

        // No need to explicitly handle follow-up questions here, they are included in the message object

      } else {
        // Handle error case from backend
        const errorMessage: Message = {
          id: nextMessageId.current++,
          text: result.error || 'An error occurred.',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }

      setIsLoading(false);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);

      const errorMessage: Message = {
        id: nextMessageId.current++,
        text: "Извините, у меня сейчас проблемы с подключением. Пожалуйста, попробуйте еще раз через некоторое время.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleClearChat = async () => {
    if (conversationId) {
      try {
        const response = await fetch(`http://localhost:8000/api/chat/clear/${conversationId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setConversationId(null);
        }
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }

    setMessages([
      {
        id: 1,
        text: "Чат очищен! Я готов помочь вам с вашими вопросами по поступлению в университет.",
        isUser: false,
        timestamp: new Date(),
      }
    ]);
    setAttachedFile(null); // Also clear attached file when clearing chat
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(); // Call with no arguments to use inputText
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);
      setIsLoading(true); // Indicate loading while uploading file

      const formData = new FormData();
      formData.append('file', file);

      // Send file to the backend upload endpoint
      fetch('http://localhost:8000/api/chat/upload', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        if (data.success && data.fileId) {
          console.log('File uploaded, received ID:', data.fileId);
          setAttachedFile({ file, fileId: data.fileId }); // Save the received file and its ID
          // No alert needed, file name will be displayed
        } else {
          console.error('File upload failed:', data.error);
          alert('Ошибка загрузки файла.');
        }
      })
      .catch(error => {
        console.error('Error during file upload fetch:', error);
        alert('Ошибка при загрузке файла.');
      })
      .finally(() => {
        setIsLoading(false); // End loading indicator
        e.target.value = ''; // Clear the input so the same file can be selected again
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Ivy Apply AI</h1>
        <button
          onClick={handleClearChat}
          className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
        >
          Очистить историю
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3xl px-4 py-3 rounded-lg ${
              message.isUser
                ? 'bg-harvard-crimson text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              {message.isUser ? (
                // Render user message
                message.fileName ? (
                  // Render attached file for user
                  <div className="flex items-center space-x-2">
                    {/* File icon (you can use a library or custom icons here) */}
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white text-gray-900 rounded">
                      {/* Simple text icon based on type */}
                      <span className="text-xs font-bold">{message.fileType?.split('/')[1]?.toUpperCase().substring(0, 3) || 'FILE'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{message.fileName}</p>
                      {message.fileSize !== undefined && (
                        <p className="text-xs text-blue-100">{(message.fileSize / 1024).toFixed(2)} KB</p>
                      )}
                    </div>
                  </div>
                ) : (
                  // Render regular text message for user
                  <p className="whitespace-pre-wrap">{message.text}</p>
                )
              ) : (
                // Render bot message (Markdown)
                <ReactMarkdown remarkPlugins={[remarkGfm]}
                   components={{
                     p: ({ node, ...props }) => <p className="whitespace-pre-wrap mb-4" {...props} />,
                     a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                    }}
                 >
                   {message.text}
                 </ReactMarkdown>
              )}
              <p className={`text-xs mt-1 ${
                message.isUser ? 'text-red-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {/* Render follow-up questions as buttons */}
        {messages.map((message) => (
          !message.isUser && message.followUpQuestions && message.followUpQuestions.length > 0 && (
            <div key={`follow-ups-${message.id}`} className="flex justify-start mt-2">
              <div className="flex flex-wrap gap-2">
                {message.followUpQuestions.map((question, index) => (
                  <button
                    key={`follow-up-${message.id}-${index}`}
                    onClick={() => handleSendMessage(question)} // Send the follow-up question
                    className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )
        ))}
        
        {isLoading && !streamingText && (
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
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
          />
          {/* File upload button */}
          <label
            htmlFor="file-upload"
            className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span className="text-2xl font-bold text-gray-700 inline-flex items-center justify-center transform -translate-y-px">+</span>
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
                  {attachedFile.file.name.split('.').pop()?.toUpperCase().substring(0, 3) ||
                   attachedFile.file.type?.split('/')[1]?.toUpperCase().substring(0, 3) ||
                   'ФАЙЛ'}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{attachedFile.file.name}</p>
                {attachedFile.file.size !== undefined && (
                  <p className="text-xs text-gray-600">{(attachedFile.file.size / 1024).toFixed(2)} KB</p>
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
            className={`px-6 py-2 rounded-lg font-medium ${
              isLoading || (!inputText.trim() && !attachedFile)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-harvard-crimson text-white hover:bg-red-700'
            }`}
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
