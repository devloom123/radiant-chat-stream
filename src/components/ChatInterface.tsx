
import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Plus, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { SettingsPanel } from './SettingsPanel';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useApiKey } from '@/hooks/useApiKey';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chat-sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

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
    if (!inputValue.trim()) return;

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
    setIsLoading(true);

    try {
      const systemPrompt = `You are DevLoom, an advanced AI assistant created to help developers and tech enthusiasts. You are knowledgeable, friendly, and always eager to help with coding, technology, and creative solutions. 

Key traits:
- Provide clear, well-structured responses
- Use proper formatting with code blocks when appropriate
- Be concise but thorough in explanations
- Show enthusiasm for helping with technical challenges
- Always maintain a professional yet approachable tone

When responding:
- Use markdown formatting for better readability
- Structure your responses with headers, lists, and code blocks when relevant
- Provide practical examples when explaining concepts
- Ask clarifying questions when needed`;

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
            ? { ...msg, isStreaming: false }
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0A0E1A] via-[#1A1F2E] to-[#0F1419] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/10 bg-gradient-to-b from-[#1A1F2E]/90 to-[#0F1419]/90 backdrop-blur-xl flex flex-col animate-slide-in-left">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4 mb-6 animate-fade-in">
            <div className="relative group">
              <img 
                src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
                alt="DevLoom AI" 
                className="w-12 h-12 rounded-2xl shadow-2xl ring-2 ring-[#22C55E]/20 group-hover:ring-[#22C55E]/40 transition-all duration-300"
              />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full border-2 border-[#1A1F2E] animate-pulse shadow-lg"></div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#22C55E]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-white text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                DevLoom AI
              </h1>
              <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                <Sparkles className="w-3 h-3 text-[#22C55E]" />
                Your AI Coding Assistant
              </p>
            </div>
          </div>
          
          <Button
            onClick={createNewChat}
            className="w-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#22C55E] text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 group rounded-xl h-12"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold">New Chat</span>
          </Button>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {chatSessions.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600 animate-pulse" />
                <p className="text-gray-500 text-sm font-medium">No conversations yet</p>
                <p className="text-gray-600 text-xs mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              chatSessions.map((session, index) => (
                <button
                  key={session.id}
                  onClick={() => loadChatSession(session.id)}
                  className={`w-full text-left p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 border group hover:border-white/20 hover:shadow-lg hover:scale-105 transform animate-fade-in ${
                    currentSessionId === session.id 
                      ? 'bg-gradient-to-r from-[#22C55E]/10 to-[#16A34A]/10 border-[#22C55E]/30 shadow-lg scale-105' 
                      : 'border-white/5 hover:border-white/20'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="text-sm text-white truncate font-semibold mb-2 group-hover:text-[#22C55E] transition-colors">
                    {session.title}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="bg-gray-800/50 px-2 py-1 rounded-lg">
                      {session.messages.length} messages
                    </span>
                    <span>•</span>
                    <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Settings Button */}
        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="w-full text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 h-12 group"
            size="lg"
          >
            <Settings className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-medium">Settings</span>
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col animate-fade-in">
        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-5xl mx-auto px-6">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[70vh] animate-fade-in">
                <div className="text-center">
                  <div className="relative mb-8 animate-float">
                    <img 
                      src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
                      alt="DevLoom AI" 
                      className="w-24 h-24 rounded-3xl mx-auto shadow-2xl ring-4 ring-[#22C55E]/20"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full flex items-center justify-center animate-pulse shadow-xl">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#22C55E]/20 to-transparent animate-pulse"></div>
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent animate-gradient">
                    Welcome to DevLoom AI
                  </h2>
                  <p className="text-gray-400 mb-12 text-lg max-w-md mx-auto leading-relaxed">
                    Your intelligent coding companion powered by advanced AI technology
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {[
                      {
                        icon: "🚀",
                        title: "Code Assistance",
                        description: "Get help with debugging, optimization, and best practices",
                        gradient: "from-blue-500/20 to-purple-500/20",
                        border: "border-blue-500/20"
                      },
                      {
                        icon: "💡",
                        title: "Technical Guidance", 
                        description: "Architecture advice, technology recommendations, and more",
                        gradient: "from-green-500/20 to-teal-500/20",
                        border: "border-green-500/20"
                      }
                    ].map((card, index) => (
                      <div
                        key={index}
                        className={`bg-gradient-to-br ${card.gradient} backdrop-blur-sm p-8 rounded-3xl border ${card.border} hover:border-[#22C55E]/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl group animate-fade-in`}
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        <div className="w-14 h-14 bg-gradient-to-r from-[#22C55E]/20 to-[#16A34A]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-2xl">{card.icon}</span>
                        </div>
                        <h3 className="font-bold text-white mb-3 text-lg">{card.title}</h3>
                        <p className="text-gray-400 leading-relaxed">{card.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-8 py-8">
              {messages.map((message, index) => (
                <div 
                  key={message.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <MessageBubble message={message} />
                </div>
              ))}
            </div>
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-white/10 p-6 bg-gradient-to-r from-[#1A1F2E]/80 to-[#0F1419]/80 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto">
            <div className="relative group">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message DevLoom AI..."
                disabled={isLoading}
                className="pr-16 h-14 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-[#22C55E] focus:ring-[#22C55E]/20 rounded-2xl backdrop-blur-sm text-lg transition-all duration-300 hover:bg-white/10 focus:bg-white/10 group-hover:shadow-lg"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="sm"
                className="absolute right-3 top-3 bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#22C55E] text-white rounded-xl h-8 w-8 p-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 hover:shadow-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center animate-pulse">
              DevLoom AI is powered by advanced language models. Always verify important information.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="animate-slide-in-right">
          <SettingsPanel onClose={() => setShowSettings(false)} />
        </div>
      )}
    </div>
  );
};
