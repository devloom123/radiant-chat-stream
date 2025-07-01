
import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useApiKey } from '@/hooks/useApiKey';

interface PromptImproverProps {
  originalPrompt: string;
  onImprovedPrompt: (improvedPrompt: string) => void;
  darkMode?: boolean;
}

export const PromptImprover: React.FC<PromptImproverProps> = ({
  originalPrompt,
  onImprovedPrompt,
  darkMode = true,
}) => {
  const [isImproving, setIsImproving] = useState(false);
  const { toast } = useToast();
  const { apiKey } = useApiKey();

  const improvePrompt = async () => {
    if (!originalPrompt.trim() || !apiKey) return;

    setIsImproving(true);
    try {
      console.log('Improving prompt with API key:', apiKey.substring(0, 20) + '...');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'DevLoom AI - Prompt Improver'
        },
        body: JSON.stringify({
          model: 'qwen/qwen-2.5-72b-instruct',
          messages: [
            {
              role: 'system',
              content: `You are an expert prompt engineer. Your task is to improve user prompts to be more clear, specific, and effective for AI assistance. 

Guidelines for improvement:
- Make the prompt more specific and actionable
- Add context where helpful
- Structure the request clearly
- Maintain the original intent
- Keep it concise but comprehensive
- Add examples if helpful

Return only the improved prompt, nothing else.`
            },
            {
              role: 'user',
              content: `Please improve this prompt: "${originalPrompt}"`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid API key');
        } else if (response.status === 402) {
          throw new Error('Insufficient credits');
        } else {
          throw new Error('Failed to improve prompt');
        }
      }

      const data = await response.json();
      const improvedPrompt = data.choices[0]?.message?.content?.trim();

      if (improvedPrompt) {
        onImprovedPrompt(improvedPrompt);
        toast({
          title: "Prompt Improved!",
          description: "Your prompt has been enhanced for better results.",
        });
      }
    } catch (error) {
      console.error('Error improving prompt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not improve the prompt. Please try again.';
      
      toast({
        title: "Improvement Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={improvePrompt}
      disabled={isImproving || !originalPrompt.trim() || !apiKey}
      className={`${darkMode ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-400/10' : 'text-purple-600 hover:text-purple-700 hover:bg-purple-100'} p-2 h-8 w-8 rounded-lg transition-all duration-200 disabled:opacity-50`}
      title={!apiKey ? "API key required" : "Improve prompt"}
    >
      {isImproving ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Wand2 className="w-4 h-4" />
      )}
    </Button>
  );
};
