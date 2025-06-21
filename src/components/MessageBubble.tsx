
import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from './ChatInterface';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
          : 'bg-gradient-to-r from-blue-500 to-purple-600'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-3xl ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`
          rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md
          ${isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm' 
            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
          }
        `}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-5 bg-current opacity-75 animate-pulse ml-1" />
            )}
          </div>
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-400 mt-1 px-1 ${isUser ? 'text-right' : ''}`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};
