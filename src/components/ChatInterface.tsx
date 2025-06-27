import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Plus, Sparkles, MessageCircle, Trash2, Mic, MicOff, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { SettingsPanel } from './SettingsPanel';
import { LoadingAnimation } from './LoadingAnimation';
import { FileUpload } from './FileUpload';
import { PromptImprover } from './PromptImprover';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useApiKey } from '@/hooks/useApiKey';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { AuthPage } from './AuthPage';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
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

  // Add the missing scrollToBottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show loading animation for 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingAnimation(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (transcript) {
      setInputValue(prev => prev + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const createNewChat = () => {
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
  };

  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  const deleteChat = (sessionId: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
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

    try {
      const systemPrompt = `You are DevLoom, an advanced AI assistant created to help developers and tech enthusiasts. You are knowledgeable, friendly, and always eager to help with coding, technology, and creative solutions.`;

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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#0F0F0F] text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-gray-800 bg-[#171717] flex flex-col overflow-hidden`}>
        {showSidebar && (
          <>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
                    alt="DevLoom AI" 
                    className="w-8 h-8 rounded-lg"
                  />
                  <span className="font-semibold text-white">DevLoom AI</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                onClick={createNewChat}
                className="w-full bg-white text-black hover:bg-gray-200 font-medium rounded-lg h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                New chat
              </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-lg"
                />
              </div>
            </div>

            {/* Chat History */}
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-1">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors ${
                      currentSessionId === session.id ? 'bg-gray-800' : ''
                    }`}
                    onClick={() => loadChatSession(session.id)}
                  >
                    <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{session.title}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(session.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Settings */}
            <div className="p-4 border-t border-gray-800">
              <Button
                variant="ghost"
                onClick={() => setShowSettings(true)}
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg h-10"
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
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#171717]">
          {!showSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(true)}
              className="text-gray-400 hover:text-white h-8 w-8 p-0"
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <div className="text-center flex-1">
            <h1 className="text-lg font-semibold text-white">DevLoom AI</h1>
          </div>
          <div className="w-8"></div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
                <div className="mb-8">
                  <img 
                    src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
                    alt="DevLoom AI" 
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg"
                  />
                  <h2 className="text-3xl font-bold text-white mb-2">How can I help you today?</h2>
                  <p className="text-gray-400 mb-8">Start a conversation with your AI assistant</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  {[
                    { title: "Code Review", desc: "Help me review and improve my code", icon: "💻" },
                    { title: "Debug Issues", desc: "Find and fix bugs in my application", icon: "🐛" },
                    { title: "Architecture", desc: "Design system architecture", icon: "🏗️" },
                    { title: "Best Practices", desc: "Learn coding best practices", icon: "⭐" },
                  ].map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 cursor-pointer transition-colors border border-gray-700"
                      onClick={() => setInputValue(suggestion.desc)}
                    >
                      <div className="text-2xl mb-2">{suggestion.icon}</div>
                      <div className="font-medium text-white mb-1">{suggestion.title}</div>
                      <div className="text-sm text-gray-400">{suggestion.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-[#171717]">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-3 p-3 bg-gray-800 rounded-2xl border border-gray-700 focus-within:border-gray-600">
              <FileUpload
                onFileSelect={(files) => setSelectedFiles(prev => [...prev, ...files])}
                selectedFiles={selectedFiles}
                onRemoveFile={(index) => {
                  setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                }}
              />
              
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message DevLoom AI..."
                  disabled={isLoading}
                  className="border-0 bg-transparent text-white placeholder-gray-400 focus:ring-0 p-0 text-base resize-none"
                  style={{ boxShadow: 'none' }}
                />
              </div>

              <div className="flex items-center gap-2">
                <PromptImprover
                  originalPrompt={inputValue}
                  onImprovedPrompt={setInputValue}
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
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}

                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || (!inputValue.trim() && selectedFiles.length === 0)}
                  className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 h-8 w-8 p-0 rounded-lg"
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
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};
