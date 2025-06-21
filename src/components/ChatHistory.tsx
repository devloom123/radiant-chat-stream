
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare } from 'lucide-react';
import { ChatSession } from './ChatInterface';

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession
}) => {
  return (
    <div className="w-80 bg-gray-800/50 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Chat History
        </h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No chat history yet</p>
              <p className="text-sm">Start a conversation to see your chats here</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg border transition-colors cursor-pointer ${
                  currentSessionId === session.id
                    ? 'bg-[#238636]/20 border-[#238636]/30'
                    : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50'
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate mb-1">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{session.messages.length} messages</span>
                      <span>•</span>
                      <span>{session.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-1 h-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {session.messages.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 truncate">
                    {session.messages[session.messages.length - 1]?.content.slice(0, 60)}...
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
