
import React, { useState, useRef, useEffect } from 'react';
import { SettingsPanel } from './SettingsPanel';
import { LoadingAnimation } from './LoadingAnimation';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { ApiKeySetup } from './ApiKeySetup';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
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
  const { apiKey, loading: apiKeyLoading } = useApiKey();
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

  if (authLoading || apiKeyLoading) {
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

  if (!apiKey) {
    return (
      <div className={`flex h-screen ${darkMode ? 'bg-[#0F0F0F] text-white' : 'bg-white text-black'} items-center justify-center`}>
        <ApiKeySetup darkMode={darkMode} />
      </div>
    );
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

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please setup your OpenRouter API key first.",
        variant: "destructive",
      });
      return;
    }

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

      console.log('Making request to OpenRouter with API key:', apiKey.substring(0, 20) + '...');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'DevLoom AI'
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

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenRouter API key.');
        } else if (response.status === 402) {
          throw new Error('Insufficient credits. Please check your OpenRouter account balance.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to DevLoom AI. Please try again.';
      
      toast({
        title: "Connection Error",
        description: errorMessage,
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

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-[#0F0F0F] text-white' : 'bg-white text-black'} overflow-hidden transition-colors duration-300`}>
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300`}>
        <ChatSidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          chatSessions={chatSessions}
          currentSessionId={currentSessionId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showStats={showStats}
          setShowStats={setShowStats}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isFullScreen={isFullScreen}
          createNewChat={createNewChat}
          loadChatSession={loadChatSession}
          deleteChat={deleteChat}
          setShowKeyboardShortcuts={setShowKeyboardShortcuts}
          setShowSettings={setShowSettings}
          toggleFullScreen={toggleFullScreen}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          darkMode={darkMode}
          scrollToBottom={scrollToBottom}
        />

        {/* Messages */}
        <ChatMessages
          messages={messages}
          showTemplates={showTemplates}
          setShowTemplates={setShowTemplates}
          setInputValue={setInputValue}
          viewMode={viewMode}
          darkMode={darkMode}
          isTyping={isTyping}
          handleReactToMessage={handleReactToMessage}
          messagesEndRef={messagesEndRef}
        />

        {/* Input Area */}
        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          isLoading={isLoading}
          isListening={isListening}
          speechSupported={speechSupported}
          darkMode={darkMode}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          startListening={startListening}
          stopListening={stopListening}
        />
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
