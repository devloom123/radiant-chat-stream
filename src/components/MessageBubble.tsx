
import React from 'react';
import { User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from './ChatInterface';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`group relative ${isUser ? 'ml-auto' : ''}`}>
      <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-[#238636]' 
            : 'bg-gradient-to-r from-purple-500 to-blue-500'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <img 
              src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
              alt="DevLoom AI" 
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>

        {/* Message Content */}
        <div className={`max-w-3xl ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
          <div className={`
            rounded-2xl px-4 py-3 max-w-full
            ${isUser 
              ? 'bg-[#238636] text-white' 
              : 'bg-gray-800/50 text-gray-100 border border-gray-700'
            }
          `}>
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            ) : (
              <div className="prose prose-invert max-w-none prose-pre:bg-gray-900 prose-code:bg-gray-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-headings:text-gray-100 prose-p:text-gray-200 prose-li:text-gray-200 prose-strong:text-white">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: ({node, inline, className, children, ...props}) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline ? (
                        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto my-2">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            
            {message.isStreaming && (
              <span className="inline-block w-2 h-5 bg-current opacity-75 animate-pulse ml-1" />
            )}
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-gray-500 mt-1 px-1 ${isUser ? 'text-right' : ''}`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
