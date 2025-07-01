
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useApiKey } from '@/hooks/useApiKey';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';

interface ApiKeySetupProps {
  onComplete?: () => void;
  darkMode?: boolean;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onComplete, darkMode = true }) => {
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { saveApiKey } = useApiKey();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!inputKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key.",
        variant: "destructive",
      });
      return;
    }

    if (!inputKey.startsWith('sk-or-v1-')) {
      toast({
        title: "Invalid API Key",
        description: "OpenRouter API keys should start with 'sk-or-v1-'",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await saveApiKey(inputKey);
      
      if (error) {
        toast({
          title: "Save Failed",
          description: "Failed to save API key. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "API Key Saved",
          description: "Your OpenRouter API key has been saved successfully.",
        });
        setInputKey('');
        onComplete?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`${darkMode ? 'text-white' : 'text-black'}`}>
          Setup OpenRouter API Key
        </CardTitle>
        <CardDescription className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Enter your OpenRouter API key to start chatting with DevLoom AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Input
            type={showKey ? 'text' : 'password'}
            placeholder="sk-or-v1-..."
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className={`pr-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowKey(!showKey)}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className={`w-full ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
        >
          {isLoading ? 'Saving...' : 'Save API Key'}
        </Button>
        
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-sm mb-2">Don't have an OpenRouter API key?</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://openrouter.ai/keys', '_blank')}
            className={`${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Get API Key
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
