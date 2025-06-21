
import React from 'react';
import { X, Key, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SettingsPanelProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onClose: () => void;
}

const MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'Meta' },
  { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  apiKey,
  setApiKey,
  selectedModel,
  setSelectedModel,
  onClose,
}) => {
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('openrouter-api-key', key);
  };

  return (
    <div className="w-80 border-l bg-white/90 backdrop-blur-sm animate-slide-in-right">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Settings</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-4 space-y-6">
        {/* API Key Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Key className="w-4 h-4" />
              OpenRouter API Key
            </CardTitle>
            <CardDescription className="text-xs">
              Your API key is stored locally and never sent to our servers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your OpenRouter API key"
                value={apiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-gray-500">
                Get your API key from{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  openrouter.ai
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Model Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Model
            </CardTitle>
            <CardDescription className="text-xs">
              Choose the AI model for your conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="text-left">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.provider}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-2">
          <p>
            <strong>OpenRouter</strong> provides access to multiple AI models through a single API.
          </p>
          <p>
            Streaming responses provide real-time AI output for a better chat experience.
          </p>
        </div>
      </div>
    </div>
  );
};
