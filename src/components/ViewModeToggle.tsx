
import React from 'react';
import { LayoutList, AlignJustify } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewModeToggleProps {
  viewMode: 'compact' | 'comfortable';
  onToggle: (mode: 'compact' | 'comfortable') => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, onToggle }) => {
  return (
    <div className="flex items-center bg-gray-800 rounded-lg p-1">
      <Button
        variant={viewMode === 'compact' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onToggle('compact')}
        className={`h-8 px-3 ${
          viewMode === 'compact' 
            ? 'bg-white text-black' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
      >
        <LayoutList className="w-4 h-4 mr-1" />
        Compact
      </Button>
      <Button
        variant={viewMode === 'comfortable' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onToggle('comfortable')}
        className={`h-8 px-3 ${
          viewMode === 'comfortable' 
            ? 'bg-white text-black' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
      >
        <AlignJustify className="w-4 h-4 mr-1" />
        Comfortable
      </Button>
    </div>
  );
};
