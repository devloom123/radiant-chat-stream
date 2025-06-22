
import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from './ChatInterface';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`group relative animate-fade-in ${isUser ? 'ml-auto' : ''}`}>
      <div className={`flex gap-6 ${isUser ? 'flex-row-reverse' : ''} max-w-4xl ${isUser ? 'ml-auto' : 'mr-auto'}`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 transition-all duration-300 hover:scale-110 ${
          isUser 
            ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] ring-[#22C55E]/20 hover:ring-[#22C55E]/40' 
            : 'bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 ring-purple-500/20 hover:ring-purple-500/40'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
          <div className={`
            rounded-3xl px-6 py-4 max-w-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl
            ${isUser 
              ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-[#22C55E]/20 hover:shadow-[#22C55E]/30' 
              : 'bg-white/5 text-gray-100 border border-white/10 hover:bg-white/10 hover:border-white/20'
            }
          `}>
            {isUser ? (
              <div className="whitespace-pre-wrap break-words leading-relaxed font-medium">
                {message.content}
              </div>
            ) : (
              <div className="prose prose-invert max-w-none prose-pre:bg-gray-900/80 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-code:bg-white/10 prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:text-sm prose-code:font-medium prose-headings:text-gray-100 prose-p:text-gray-200 prose-li:text-gray-200 prose-strong:text-white prose-blockquote:border-l-[#22C55E] prose-blockquote:bg-[#22C55E]/5 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: (props) => {
                      const { children, className, ...rest } = props;
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-white/10 px-2 py-1 rounded-lg text-sm font-medium border border-white/10" {...rest}>
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-gray-900/80 p-6 rounded-2xl overflow-x-auto my-4 border border-white/10 shadow-inner">
                          <code className={className} {...rest}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    h1: (props) => <h1 className="text-2xl font-bold text-white mb-4 border-b border-white/20 pb-2" {...props} />,
                    h2: (props) => <h2 className="text-xl font-bold text-white mb-3 mt-6" {...props} />,
                    h3: (props) => <h3 className="text-lg font-semibold text-white mb-2 mt-4" {...props} />,
                    ul: (props) => <ul className="space-y-2 my-4" {...props} />,
                    ol: (props) => <ol className="space-y-2 my-4" {...props} />,
                    li: (props) => <li className="text-gray-200 leading-relaxed" {...props} />,
                    p: (props) => <p className="text-gray-200 leading-relaxed mb-4" {...props} />,
                    blockquote: (props) => (
                      <blockquote 
                        className="border-l-4 border-[#22C55E] bg-[#22C55E]/5 px-4 py-3 rounded-r-xl my-4 italic" 
                        {...props} 
                      />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            
            {message.isStreaming && (
              <div className="flex items-center mt-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="ml-2 text-xs opacity-70">Thinking...</span>
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-gray-500 mt-2 px-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${isUser ? 'text-right' : ''}`}>
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
