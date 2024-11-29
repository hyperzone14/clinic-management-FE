import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import {
  createAndJoinRoom,
  sendMessage,
  selectChat,
  clearChat,
} from "../../redux/slices/chatbotSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

const Chatbot = () => {
  const dispatch = useAppDispatch();
  const chatState = useAppSelector(selectChat);
  const {
    messages = [],
    isConnected = false,
    loading = false,
  } = chatState || {};
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem("userId") || "1";

  // Updated helper function to parse and clean JSON responses
  const cleanMessageContent = (content: string | undefined) => {
    if (!content) return "";
    const cleanedContent = content.replace("@bot", "").trim();
    
    try {
      const jsonContent = JSON.parse(cleanedContent);
      // If the response has an "answer" field, return just that
      if (jsonContent.answer) {
        return jsonContent.answer;
      }
      // If it's just a string in JSON, return that
      if (typeof jsonContent === 'string') {
        return jsonContent;
      }
      // Fallback to the original cleaned content if not parseable as expected
      return cleanedContent;
    } catch (e) {
      // If it's not JSON, return the cleaned content as is
      return cleanedContent;
    }
  };

  useEffect(() => {
    if (isOpen && !isConnected && !loading) {
      dispatch(createAndJoinRoom(Number(currentUserId)));
    }
  }, [isOpen, isConnected, loading, dispatch, currentUserId]);

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      dispatch(clearChat());
    };
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && isConnected) {
      dispatch(
        sendMessage({
          content: inputMessage.trim(),
          sender: `User_${currentUserId}`,
        })
      );
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`right-5 bg-[#4567b7] text-white p-3 rounded-full shadow-lg hover:bg-[#3E5CA3] transition-colors duration-300 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {/* Chat Window */}
      <div
        className={`absolute bottom-0 right-0 w-96 bg-white rounded-lg shadow-xl transition-all duration-300 transform ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-0 opacity-0 translate-y-12"
        }`}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 bg-blue-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium">Chat Support</h3>
            {!isConnected && (
              <div className="flex items-center space-x-1">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Connecting...</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-blue-600 rounded-full transition-colors"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Messages Area */}
        <div
          ref={messageAreaRef}
          className="h-96 p-4 overflow-y-auto space-y-3 bg-white"
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : Array.isArray(messages) && messages.length > 0 ? (
            messages.map((msg, index) => {
              if (!msg) return null;
              if (msg.type === "JOIN" || msg.type === "LEAVE") return null;

              const isCurrentUser = msg.sender === `User_${currentUserId}`;
              const cleanedContent = cleanMessageContent(msg.content);

              return (
                <div
                  key={`${msg.sender}-${index}`}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-[85%] ${
                      isCurrentUser
                        ? "bg-blue-500 text-white"
                        : "bg-gray-50 text-gray-800"
                    }`}
                  >
                    <p className="text-[15px] leading-normal whitespace-pre-wrap">
                      {cleanedContent}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex justify-center items-center h-full text-gray-400">
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}
        </div>

        {/* Chat Input Area */}
        <div className="p-4 border-t bg-white rounded-b-lg">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isConnected ? "Type your message..." : "Connecting..."
              }
              className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-gray-50"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected || !inputMessage.trim()}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;