
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Copy, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface MessageActionsProps {
  content: string;
  messageId: string;
  onReaction?: (messageId: string, reaction: 'like' | 'dislike') => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  messageId,
  onReaction,
}) => {
  const { toast } = useToast();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleReaction = (type: 'like' | 'dislike') => {
    const newReaction = reaction === type ? null : type;
    setReaction(newReaction);
    onReaction?.(messageId, type);
    
    toast({
      title: newReaction ? `Message ${type}d` : "Reaction removed",
      description: newReaction ? `You ${type}d this message` : "Reaction cleared",
    });
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(content);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReaction('like')}
        className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
          reaction === 'like' 
            ? 'text-green-400 bg-green-400/10 hover:bg-green-400/20' 
            : 'text-gray-400 hover:text-green-400 hover:bg-green-400/10'
        }`}
      >
        <ThumbsUp className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReaction('dislike')}
        className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
          reaction === 'dislike' 
            ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20' 
            : 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'
        }`}
      >
        <ThumbsDown className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all duration-200"
      >
        <Copy className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSpeak}
        className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
          isSpeaking 
            ? 'text-purple-400 bg-purple-400/10 hover:bg-purple-400/20' 
            : 'text-gray-400 hover:text-purple-400 hover:bg-purple-400/10'
        }`}
      >
        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </Button>
    </div>
  );
};
