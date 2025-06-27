
import React, { useState } from 'react';
import { Smile, ThumbsUp, Heart, Star, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageReactionsProps {
  messageId: string;
  reactions?: { [emoji: string]: number };
  onReact: (messageId: string, emoji: string) => void;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions = {},
  onReact
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const availableReactions = [
    { emoji: '👍', icon: ThumbsUp, label: 'Like' },
    { emoji: '❤️', icon: Heart, label: 'Love' },
    { emoji: '⭐', icon: Star, label: 'Star' },
    { emoji: '🚀', icon: Zap, label: 'Rocket' },
    { emoji: '🧠', icon: Brain, label: 'Smart' },
    { emoji: '😊', icon: Smile, label: 'Happy' },
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-1 flex-wrap">
        {Object.entries(reactions).map(([emoji, count]) => (
          count > 0 && (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full"
              onClick={() => onReact(messageId, emoji)}
            >
              {emoji} {count}
            </Button>
          )
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
          onClick={() => setShowReactions(!showReactions)}
        >
          <Smile className="w-3 h-3" />
        </Button>
      </div>

      {showReactions && (
        <div className="absolute bottom-8 left-0 bg-gray-800 border border-gray-700 rounded-lg p-2 flex gap-1 shadow-lg z-10">
          {availableReactions.map((reaction) => (
            <Button
              key={reaction.emoji}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-700 rounded-lg text-lg"
              onClick={() => {
                onReact(messageId, reaction.emoji);
                setShowReactions(false);
              }}
              title={reaction.label}
            >
              {reaction.emoji}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
