
import React from 'react';
import { Plus, Search, Menu, X, BarChart3, MessageCircle, Trash2, Keyboard, Maximize, Minimize, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ViewModeToggle } from './ViewModeToggle';
import { ConversationStats } from './ConversationStats';
import { ChatSession } from './ChatInterface';

interface ChatSidebarProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'compact' | 'comfortable';
  setViewMode: (mode: 'compact' | 'comfortable') => void;
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isFullScreen: boolean;
  createNewChat: () => void;
  loadChatSession: (sessionId: string) => void;
  deleteChat: (sessionId: string) => void;
  setShowKeyboardShortcuts: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  toggleFullScreen: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  showSidebar,
  setShowSidebar,
  chatSessions,
  currentSessionId,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  showStats,
  setShowStats,
  darkMode,
  setDarkMode,
  isFullScreen,
  createNewChat,
  loadChatSession,
  deleteChat,
  setShowKeyboardShortcuts,
  setShowSettings,
  toggleFullScreen,
}) => {
  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!showSidebar) return null;

  return (
    <div className={`w-80 transition-all duration-300 border-r ${darkMode ? 'border-gray-800 bg-[#171717]' : 'border-gray-200 bg-gray-50'} flex flex-col overflow-hidden`}>
      {/* Sidebar Header */}
      <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
              alt="DevLoom AI" 
              className="w-8 h-8 rounded-lg"
            />
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>DevLoom AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} h-8 w-8 p-0`}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(false)}
              className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} h-8 w-8 p-0`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Button
          onClick={createNewChat}
          className={`w-full ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} font-medium rounded-lg h-10 transition-colors duration-200`}
        >
          <Plus className="w-4 h-4 mr-2" />
          New chat
        </Button>
      </div>

      {showStats && (
        <div className="p-4 border-b border-gray-800">
          <ConversationStats 
            sessions={chatSessions} 
            currentSessionId={currentSessionId} 
          />
        </div>
      )}

      {/* Search */}
      <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-4 h-4`} />
          <Input
            id="search-input"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} rounded-lg`}
          />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="p-4 border-b border-gray-800">
        <ViewModeToggle viewMode={viewMode} onToggle={setViewMode} />
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors ${
                currentSessionId === session.id ? 'bg-gray-800' : ''
              } ${viewMode === 'compact' ? 'py-2' : 'py-3'}`}
              onClick={() => loadChatSession(session.id)}
            >
              <MessageCircle className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${darkMode ? 'text-white' : 'text-black'} truncate`}>{session.title}</div>
                {viewMode === 'comfortable' && (
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(session.id);
                }}
                variant="ghost"
                size="sm"
                className={`opacity-0 group-hover:opacity-100 ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'} h-6 w-6 p-0`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Settings */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="ghost"
            onClick={() => setShowKeyboardShortcuts(true)}
            className={`flex-1 justify-start ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'} rounded-lg h-10`}
          >
            <Keyboard className="w-4 h-4 mr-3" />
            Shortcuts
          </Button>
          <Button
            variant="ghost"
            onClick={toggleFullScreen}
            className={`${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'} h-10 w-10 p-0`}
          >
            {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setDarkMode(!darkMode)}
            className={`${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'} h-10 w-10 p-0`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={() => setShowSettings(true)}
          className={`w-full justify-start ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'} rounded-lg h-10`}
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );
};
