
import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from './ChatInterface';
import { MessageActions } from './MessageActions';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`group flex gap-4 ${isUser ? 'flex-row-reverse' : ''} max-w-4xl mx-auto`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-[#22C55E]' 
          : 'bg-[#AB68FF]'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-full ${
          isUser 
            ? 'bg-[#2D2D2D] text-white rounded-2xl px-4 py-3' 
            : 'text-white'
        }`}>
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          ) : (
            <div className="prose prose-invert max-w-none prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-xl prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-headings:text-white prose-p:text-gray-100 prose-li:text-gray-100 prose-strong:text-white prose-blockquote:border-l-[#22C55E] prose-blockquote:bg-[#22C55E]/10 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code: (props) => {
                    const { children, className, ...rest } = props;
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-gray-800 px-2 py-1 rounded text-sm font-medium" {...rest}>
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-900 p-4 rounded-xl overflow-x-auto my-4 border border-gray-700">
                        <code className={className} {...rest}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  h1: (props) => <h1 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2" {...props} />,
                  h2: (props) => <h2 className="text-lg font-bold text-white mb-2 mt-4" {...props} />,
                  h3: (props) => <h3 className="text-base font-semibold text-white mb-2 mt-3" {...props} />,
                  ul: (props) => <ul className="space-y-1 my-3" {...props} />,
                  ol: (props) => <ol className="space-y-1 my-3" {...props} />,
                  li: (props) => <li className="text-gray-100" {...props} />,
                  p: (props) => <p className="text-gray-100 mb-3 leading-relaxed" {...props} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {message.isStreaming && (
            <div className="flex items-center mt-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="ml-2 text-xs text-gray-400">Thinking...</span>
            </div>
          )}
        </div>
        
        {/* Message Actions for AI responses */}
        {!isUser && !message.isStreaming && (
          <MessageActions
            content={message.content}
            messageId={message.id}
          />
        )}
      </div>
    </div>
  );
};
