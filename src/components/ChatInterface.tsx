import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Plus } from 'lucide-react';
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
    return saved ? JSON.parse(saved) : [];
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

  // Show auth page if user is not authenticated
  if (authLoading) {
    return (
      <div className="flex h-screen bg-[#0D1117] items-center justify-center">
        <div className="text-white">Loading...</div>
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
    
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenRouter API key in settings.",
        variant: "destructive",
      });
      setShowSettings(true);
      return;
    }

    // Create new session if none exists
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

        // Mark streaming as complete and update session
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
        title: "Error",
        description: "Failed to get response from DevLoom. Please check your API key and try again.",
        variant: "destructive",
      });
      
      // Remove the failed assistant message
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
    <div className="flex h-screen bg-[#0D1117] text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-[#161B22] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
              alt="DevLoom AI" 
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <h1 className="font-semibold text-white">DevLoom AI</h1>
              <p className="text-xs text-gray-400">Your AI Coding Assistant</p>
            </div>
          </div>
          
          <Button
            onClick={createNewChat}
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white border-0"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {chatSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => loadChatSession(session.id)}
                className={`w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                  currentSessionId === session.id ? 'bg-gray-800' : ''
                }`}
              >
                <div className="text-sm text-white truncate">{session.title}</div>
                <div className="text-xs text-gray-400">
                  {session.updatedAt.toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Settings Button */}
        <div className="p-4 border-t border-gray-800">
          <Button
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="w-full text-gray-300 hover:text-white hover:bg-gray-800"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="text-center">
                  <img 
                    src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
                    alt="DevLoom AI" 
                    className="w-16 h-16 rounded-full mx-auto mb-6"
                  />
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Welcome to DevLoom AI
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Your intelligent coding companion powered by Qwen
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-sm">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium text-white mb-2">Code Help</h3>
                      <p className="text-gray-400">Get assistance with debugging, optimization, and best practices</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium text-white mb-2">Technical Guidance</h3>
                      <p className="text-gray-400">Architecture advice, technology recommendations, and more</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-6 p-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message DevLoom AI..."
                disabled={isLoading}
                className="pr-12 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-[#238636] focus:ring-[#238636]"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="sm"
                className="absolute right-2 top-2 bg-[#238636] hover:bg-[#2ea043] text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              DevLoom AI can make mistakes. Consider checking important information.
            </p>
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
