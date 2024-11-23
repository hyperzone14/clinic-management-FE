import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { 
  createAndJoinRoom, 
  sendMessage, 
  selectChat, 
  clearChat,
  Message 
} from '../../redux/slices/chatbotSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';

const Chatbot: React.FC = () => {
  const dispatch = useAppDispatch();
  const { messages, isConnected, loading } = useAppSelector(selectChat);
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messageAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isConnected && !loading) {
      const userId = localStorage.getItem('userId') || '1';
      dispatch(createAndJoinRoom(Number(userId)));
    }
  }, [isOpen, isConnected, loading, dispatch]);

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
      const userId = localStorage.getItem('userId') || '1';
      const message: Message = {
        sender: `User_${userId}`,
        content: inputMessage.trim(),
        type: 'CHAT'
      };
      dispatch(sendMessage(message));
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <div
        className={`absolute bottom-0 right-0 w-80 bg-white rounded-lg shadow-xl transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 bg-primary text-white rounded-t-lg">
          <h3 className="font-medium">Chat Support</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-primary/90 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={messageAreaRef} className="h-96 p-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex mb-4 ${msg.sender === `User_${localStorage.getItem('userId')}` ? 'justify-end' : ''}`}
            >
              <div 
                className={`max-w-[80%] ${
                  msg.sender === `User_${localStorage.getItem('userId')}` 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100'
                } rounded-lg p-3`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected || !inputMessage.trim()}
              className="p-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          {!isConnected && (
            <p className="text-xs text-gray-500 mt-1">Connecting to chat...</p>
          )}
          {loading && (
            <p className="text-xs text-gray-500 mt-1">Loading chat history...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;