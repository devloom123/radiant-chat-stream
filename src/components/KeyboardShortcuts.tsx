
import React, { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: 'Ctrl + Enter', action: 'Send message' },
    { key: 'Ctrl + N', action: 'New chat' },
    { key: 'Ctrl + K', action: 'Search chats' },
    { key: 'Ctrl + D', action: 'Toggle dark mode' },
    { key: 'Ctrl + /', action: 'Show shortcuts' },
    { key: 'Ctrl + B', action: 'Toggle sidebar' },
    { key: 'Ctrl + F', action: 'Search in chat' },
    { key: 'Esc', action: 'Close dialogs' },
    { key: 'Ctrl + E', action: 'Export chat' },
    { key: 'F11', action: 'Full screen' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-800 rounded-lg">
              <span className="text-gray-300">{shortcut.action}</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-sm font-mono text-gray-200">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
