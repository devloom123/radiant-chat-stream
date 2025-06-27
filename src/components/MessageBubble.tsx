
import React, { useState } from 'react';
import { User, Bot, Clock, Bookmark, BookmarkCheck, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from './ChatInterface';
import { MessageActions } from './MessageActions';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  message: Message;
  viewMode?: 'compact' | 'comfortable';
  darkMode?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  viewMode = 'comfortable',
  darkMode = true 
}) => {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const isUser = message.role === 'user';

  const handleBookmark = () => {
    // This would be handled by parent component
    console.log('Bookmark message:', message.id);
  };

  const handleEdit = () => {
    if (isUser) {
      setIsEditing(!isEditing);
      if (!isEditing) {
        setEditedContent(message.content);
      }
    }
  };

  const handleSaveEdit = () => {
    // This would be handled by parent component
    console.log('Save edit:', message.id, editedContent);
    setIsEditing(false);
  };

  return (
    <div 
      className={`group flex gap-4 ${isUser ? 'flex-row-reverse' : ''} max-w-4xl mx-auto ${
        viewMode === 'compact' ? 'py-2' : 'py-3'
      }`}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
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
        <div className="flex items-center gap-2 mb-1">
          {showTimestamp && (
            <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} ${isUser ? 'flex-row-reverse' : ''}`}>
              <Clock className="w-3 h-3" />
              <span>{message.timestamp.toLocaleTimeString()}</span>
            </div>
          )}
          {message.bookmarked && (
            <BookmarkCheck className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
          )}
        </div>
        
        <div className={`inline-block max-w-full ${
          isUser 
            ? `${darkMode ? 'bg-[#2D2D2D] text-white' : 'bg-gray-200 text-black'} rounded-2xl px-4 py-3` 
            : `${darkMode ? 'text-white' : 'text-black'}`
        }`}>
          {isUser ? (
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className={`w-full min-h-20 p-2 rounded border resize-none ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-black'
                    }`}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className={`h-7 px-2 text-xs ${
                        darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              )}
            </div>
          ) : (
            <div className={`prose prose-invert max-w-none prose-pre:${darkMode ? 'bg-gray-900 prose-pre:border-gray-700' : 'bg-gray-100 prose-pre:border-gray-300'} prose-pre:border prose-pre:rounded-xl prose-code:${darkMode ? 'bg-gray-800' : 'bg-gray-200'} prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-headings:${darkMode ? 'text-white' : 'text-black'} prose-p:${darkMode ? 'text-gray-100' : 'text-gray-800'} prose-li:${darkMode ? 'text-gray-100' : 'text-gray-800'} prose-strong:${darkMode ? 'text-white' : 'text-black'} prose-blockquote:border-l-[#22C55E] prose-blockquote:bg-[#22C55E]/10 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r`}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code: (props) => {
                    const { children, className, ...rest } = props;
                    const isInline = !className;
                    return isInline ? (
                      <code className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} px-2 py-1 rounded text-sm font-medium`} {...rest}>
                        {children}
                      </code>
                    ) : (
                      <pre className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'} p-4 rounded-xl overflow-x-auto my-4 border`}>
                        <code className={className} {...rest}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  h1: (props) => <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'} pb-2`} {...props} />,
                  h2: (props) => <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'} mb-2 mt-4`} {...props} />,
                  h3: (props) => <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-black'} mb-2 mt-3`} {...props} />,
                  ul: (props) => <ul className="space-y-1 my-3" {...props} />,
                  ol: (props) => <ol className="space-y-1 my-3" {...props} />,
                  li: (props) => <li className={`${darkMode ? 'text-gray-100' : 'text-gray-800'}`} {...props} />,
                  p: (props) => <p className={`${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-3 leading-relaxed`} {...props} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {message.isStreaming && (
            <div className="flex items-center mt-2">
              <div className="flex space-x-1">
                <div className={`w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`}></div>
                <div className={`w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                <div className={`w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Thinking...</span>
            </div>
          )}
        </div>
        
        {/* Message Actions */}
        {!message.isStreaming && (
          <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={`h-6 w-6 p-0 ${darkMode ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800' : 'text-gray-600 hover:text-yellow-600 hover:bg-gray-100'}`}
              >
                {message.bookmarked ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
              </Button>
              
              {isUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className={`h-6 w-6 p-0 ${darkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'}`}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            {/* Full Message Actions for AI responses */}
            {!isUser && (
              <MessageActions
                content={message.content}
                messageId={message.id}
                darkMode={darkMode}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
