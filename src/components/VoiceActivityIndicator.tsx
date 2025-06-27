
import React from 'react';
import { Mic } from 'lucide-react';

interface VoiceActivityIndicatorProps {
  isActive: boolean;
  level?: number;
}

export const VoiceActivityIndicator: React.FC<VoiceActivityIndicatorProps> = ({
  isActive,
  level = 0.5
}) => {
  if (!isActive) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
      <Mic className="w-4 h-4 text-red-400 animate-pulse" />
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-1 h-4 rounded-full transition-all duration-100 ${
              i < level * 5 
                ? 'bg-red-400 animate-pulse' 
                : 'bg-gray-600'
            }`}
            style={{
              height: `${8 + (i < level * 5 ? Math.random() * 8 : 0)}px`
            }}
          />
        ))}
      </div>
      <span className="text-red-400 text-sm font-medium">Listening...</span>
    </div>
  );
};
