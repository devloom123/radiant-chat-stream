
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { MessageReactions } from './MessageReactions';
import { TypingIndicator } from './TypingIndicator';
import { ChatTemplates } from './ChatTemplates';
import { Message } from './ChatInterface';

interface ChatMessagesProps {
  messages: Message[];
  showTemplates: boolean;
  setShowTemplates: (show: boolean) => void;
  setInputValue: (value: string) => void;
  viewMode: 'compact' | 'comfortable';
  darkMode: boolean;
  isTyping: boolean;
  handleReactToMessage: (messageId: string, emoji: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  showTemplates,
  setShowTemplates,
  setInputValue,
  viewMode,
  darkMode,
  isTyping,
  handleReactToMessage,
  messagesEndRef,
}) => {
  return (
    <ScrollArea className="flex-1">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
            {showTemplates ? (
              <div className="w-full">
                <div className="mb-8">
                  <img 
                    src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
                    alt="DevLoom AI" 
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg"
                  />
                  <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>Choose a template to get started</h2>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>Or start typing your own message</p>
                </div>
                <ChatTemplates onSelectTemplate={(template) => {
                  setInputValue(template);
                  setShowTemplates(false);
                }} />
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <img 
                    src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
                    alt="DevLoom AI" 
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg"
                  />
                  <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'} mb-2`}>How can I help you today?</h2>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>Start a conversation with your AI assistant</p>
                  <Button
                    onClick={() => setShowTemplates(true)}
                    variant="outline"
                    className={`${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Templates
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`space-y-${viewMode === 'compact' ? '4' : '6'}`}>
            {messages.map((message) => (
              <div key={message.id}>
                <MessageBubble message={message} viewMode={viewMode} darkMode={darkMode} />
                {message.role === 'assistant' && !message.isStreaming && (
                  <div className="mt-2 ml-12">
                    <MessageReactions
                      messageId={message.id}
                      reactions={message.reactions}
                      onReact={handleReactToMessage}
                    />
                  </div>
                )}
              </div>
            ))}
            <TypingIndicator isVisible={isTyping} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
