import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  followUpQuestions?: string[]; // Optional field for follow-up questions
}

interface ConversationHistory {
  role: 'user' | 'assistant';
  content: string;
  content_type: 'text';
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your AI admissions assistant. I can help you with essays, school selection, application guidance, and answer any questions about university admissions. How can I assist you today?",
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

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: nextMessageId.current++,
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Create a POST request to the message endpoint
      const response = await fetch('http://localhost:8000/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
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
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
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
        text: "Chat cleared! I'm ready to help you with your university admissions questions.",
        isUser: false,
        timestamp: new Date(),
      }
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Ivy Apply AI Assistant</h1>
        <button
          onClick={handleClearChat}
          className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
        >
          Clear Chat
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
                <p className="whitespace-pre-wrap">{message.text}</p>
              ) : (
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
                    onClick={() => setInputText(question)} // Set input text to the question
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
                <span className="text-sm">AI is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex space-x-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-harvard-crimson focus:outline-none focus:ring-1 focus:ring-harvard-crimson"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
            className={`px-6 py-2 rounded-lg font-medium ${
              isLoading || !inputText.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-harvard-crimson text-white hover:bg-red-700'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
