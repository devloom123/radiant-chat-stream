
import React from 'react';
import { MessageCircle, Clock, Hash, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatSession } from './ChatInterface';

interface ConversationStatsProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
}

export const ConversationStats: React.FC<ConversationStatsProps> = ({ sessions, currentSessionId }) => {
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
  const avgMessagesPerSession = sessions.length > 0 ? Math.round(totalMessages / sessions.length) : 0;
  
  const currentSessionStats = currentSession ? {
    messages: currentSession.messages.length,
    userMessages: currentSession.messages.filter(m => m.role === 'user').length,
    aiMessages: currentSession.messages.filter(m => m.role === 'assistant').length,
    duration: currentSession.updatedAt.getTime() - currentSession.createdAt.getTime()
  } : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MessageCircle className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Chats</p>
              <p className="text-xl font-bold text-white">{sessions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Hash className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Messages</p>
              <p className="text-xl font-bold text-white">{totalMessages}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg per Chat</p>
              <p className="text-xl font-bold text-white">{avgMessagesPerSession}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Chat</p>
              <p className="text-xl font-bold text-white">
                {currentSessionStats ? currentSessionStats.messages : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
