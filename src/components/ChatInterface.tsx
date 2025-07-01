import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Plus, Sparkles, MessageCircle, Trash2, Mic, MicOff, Search, Menu, X, Keyboard, Download, Moon, Sun, Maximize, Minimize, BarChart3, BookOpen, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { SettingsPanel } from './SettingsPanel';
import { LoadingAnimation } from './LoadingAnimation';
import { FileUpload } from './FileUpload';
import { PromptImprover } from './PromptImprover';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { ChatTemplates } from './ChatTemplates';
import { MessageReactions } from './MessageReactions';
import { VoiceActivityIndicator } from './VoiceActivityIndicator';
import { TypingIndicator } from './TypingIndicator';
import { ViewModeToggle } from './ViewModeToggle';
import { ConversationStats } from './ConversationStats';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useApiKey } from '@/hooks/useApiKey';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AuthPage } from './AuthPage';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  reactions?: { [emoji: string]: number };
  bookmarked?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export const ChatInterface = () => {
  const { user, loading: authLoading } = useAuth();
  const { apiKey } = useApiKey();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewMode, setViewMode] = useState<'compact' | 'comfortable'>('comfortable');
  const [showStats, setShowStats] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chat-sessions');
    if (saved) {
      try {
        const parsedSessions = JSON.parse(saved);
        return parsedSessions.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      } catch (error) {
        console.error('Error parsing chat sessions:', error);
        return [];
      }
    }
    return [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    transcript,
    isListening,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Function declarations
  function createNewChat() {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setShowTemplates(true);
  }

  const handleExportData = () => {
    const chatSessions = localStorage.getItem('chat-sessions');
    if (chatSessions) {
      const blob = new Blob([chatSessions], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devloom-chat-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Your chat history has been exported successfully.",
      });
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const scrollToBottom = () => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auto-save draft
  useAutoSave(inputValue, (value) => {
    if (value.trim()) {
      localStorage.setItem('chat-draft', value);
    } else {
      localStorage.removeItem('chat-draft');
    }
  }, 1000);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: createNewChat,
    onToggleSidebar: () => setShowSidebar(!showSidebar),
    onToggleTheme: () => setDarkMode(!darkMode),
    onShowShortcuts: () => setShowKeyboardShortcuts(true),
    onSearch: () => document.getElementById('search-input')?.focus(),
    onExport: handleExportData,
    onFullScreen: toggleFullScreen,
  });

  // Show loading animation for 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingAnimation(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('chat-draft');
    if (draft) {
      setInputValue(draft);
    }
  }, []);

  useEffect(() => {
    if (transcript) {
      setInputValue(prev => prev + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, autoScroll]);

  useEffect(() => {
    localStorage.setItem('chat-sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  if (showLoadingAnimation) {
    return <LoadingAnimation />;
  }

  if (authLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-[#0A0E1A] via-[#1A1F2E] to-[#0F1419] items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#22C55E]/20 border-t-[#22C55E] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-[#22C55E]/40 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold text-xl mb-2 animate-pulse">Loading DevLoom AI</div>
            <div className="text-gray-400 text-sm">Initializing your AI workspace...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setShowTemplates(false);
    }
  };

  const deleteChat = (sessionId: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
      setShowTemplates(true);
    }
    toast({
      title: "Chat Deleted",
      description: "The chat has been successfully deleted.",
    });
  };

  const updateCurrentSession = (newMessages: Message[]) => {
    if (!currentSessionId) return;
    
    setChatSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const title = newMessages.length > 0 && newMessages[0].role === 'user' 
          ? newMessages[0].content.slice(0, 50) + (newMessages[0].content.length > 50 ? '...' : '')
          : 'New Chat';
        
        return {
          ...session,
          title,
          messages: newMessages,
          updatedAt: new Date()
        };
      }
      return session;
    }));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && selectedFiles.length === 0) return;

    if (!currentSessionId) {
      createNewChat();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true,
    };

    const newMessages = [...messages, userMessage, assistantMessage];
    setMessages(newMessages);
    setInputValue('');
    setSelectedFiles([]);
    setIsLoading(true);
    setIsTyping(true);
    setShowTemplates(false);
    localStorage.removeItem('chat-draft');

    try {
      const customInstructions = localStorage.getItem('devloom-instructions') || '';
      const systemPrompt = `You are DevLoom, an advanced AI assistant created to help developers and tech enthusiasts. You are knowledgeable, friendly, and always eager to help with coding, technology, and creative solutions.${customInstructions ? '\n\nAdditional instructions: ' + customInstructions : ''}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen-2.5-72b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: inputValue }
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulatedContent = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  accumulatedContent += content;
                  const updatedMessages = newMessages.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  );
                  setMessages(updatedMessages);
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }

        const finalMessages = newMessages.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: accumulatedContent, isStreaming: false }
            : msg
        );
        setMessages(finalMessages);
        updateCurrentSession(finalMessages);

        // Show notification if enabled
        if (localStorage.getItem('devloom-notifications') === 'true' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('DevLoom AI', {
              body: 'New response received',
              icon: '/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png'
            });
          }
        }

        // Play sound if enabled
        if (localStorage.getItem('devloom-sound') === 'true') {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj');
          audio.volume = 0.1;
          audio.play().catch(() => {});
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to DevLoom AI. Please try again.",
        variant: "destructive",
      });
      
      const filteredMessages = newMessages.filter(msg => msg.id !== assistantMessage.id);
      setMessages(filteredMessages);
      updateCurrentSession(filteredMessages);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-[#0F0F0F] text-white' : 'bg-white text-black'} overflow-hidden transition-colors duration-300`}>
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 border-r ${darkMode ? 'border-gray-800 bg-[#171717]' : 'border-gray-200 bg-gray-50'} flex flex-col overflow-hidden`}>
        {showSidebar && (
          <>
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
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-800 bg-[#171717]' : 'border-gray-200 bg-gray-50'}`}>
          {!showSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(true)}
              className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} h-8 w-8 p-0`}
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <div className="text-center flex-1">
            <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>DevLoom AI</h1>
          </div>
          <div className="flex items-center gap-2">
            {!autoScroll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToBottom}
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} h-8 w-8 p-0`}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} h-8 px-3`}
            >
              Auto-scroll {autoScroll ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>

        {/* Messages */}
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

        {/* Voice Activity Indicator */}
        {isListening && (
          <div className="px-4 py-2">
            <div className="max-w-4xl mx-auto">
              <VoiceActivityIndicator isActive={isListening} />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-800 bg-[#171717]' : 'border-gray-200 bg-gray-50'}`}>
          <div className="max-w-4xl mx-auto">
            <div className={`relative flex items-end gap-3 p-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-2xl border focus-within:border-gray-600`}>
              <FileUpload
                onFileSelect={(files) => setSelectedFiles(prev => [...prev, ...files])}
                selectedFiles={selectedFiles}
                onRemoveFile={(index) => {
                  setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                }}
                darkMode={darkMode}
              />
              
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message DevLoom AI..."
                  disabled={isLoading}
                  className={`border-0 bg-transparent ${darkMode ? 'text-white placeholder-gray-400' : 'text-black placeholder-gray-500'} focus:ring-0 p-0 text-base resize-none`}
                  style={{ boxShadow: 'none' }}
                />
              </div>

              <div className="flex items-center gap-2">
                <PromptImprover
                  originalPrompt={inputValue}
                  onImprovedPrompt={setInputValue}
                  darkMode={darkMode}
                />

                {speechSupported && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={isListening ? stopListening : startListening}
                    className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                      isListening 
                        ? 'text-red-400 bg-red-400/10' 
                        : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-black hover:bg-black/10'}`
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}

                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || (!inputValue.trim() && selectedFiles.length === 0)}
                  className={`${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} disabled:opacity-50 h-8 w-8 p-0 rounded-lg transition-colors duration-200`}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} darkMode={darkMode} />
      )}

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
};
