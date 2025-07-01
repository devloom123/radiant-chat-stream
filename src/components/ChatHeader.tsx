
import React from 'react';
import { Menu, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  autoScroll: boolean;
  setAutoScroll: (scroll: boolean) => void;
  darkMode: boolean;
  scrollToBottom: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  showSidebar,
  setShowSidebar,
  autoScroll,
  setAutoScroll,
  darkMode,
  scrollToBottom,
}) => {
  return (
    <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-800 bg-[#171717]' : 'border-gray-200 bg-gray-50'}`}>
      {!showSidebar && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSidebar(true)}
          className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} h-8 w-8 p-0`}
        >
          <Menu className="w-4 h-4" />
        </Button>
      )}
      <div className="text-center flex-1">
        <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>DevLoom AI</h1>
      </div>
      <div className="flex items-center gap-2">
        {!autoScroll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToBottom}
            className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} h-8 w-8 p-0`}
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAutoScroll(!autoScroll)}
          className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} h-8 px-3`}
        >
          Auto-scroll {autoScroll ? 'ON' : 'OFF'}
        </Button>
      </div>
    </div>
  );
};
