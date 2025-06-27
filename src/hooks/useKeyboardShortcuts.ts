
import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
  onToggleTheme?: () => void;
  onShowShortcuts?: () => void;
  onSearch?: () => void;
  onExport?: () => void;
  onFullScreen?: () => void;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, key } = event;
      const isModifierPressed = ctrlKey || metaKey;

      if (!isModifierPressed) return;

      switch (key.toLowerCase()) {
        case 'n':
          if (config.onNewChat) {
            event.preventDefault();
            config.onNewChat();
          }
          break;
        case 'b':
          if (config.onToggleSidebar) {
            event.preventDefault();
            config.onToggleSidebar();
          }
          break;
        case 'd':
          if (config.onToggleTheme) {
            event.preventDefault();
            config.onToggleTheme();
          }
          break;
        case '/':
          if (config.onShowShortcuts) {
            event.preventDefault();
            config.onShowShortcuts();
          }
          break;
        case 'k':
          if (config.onSearch) {
            event.preventDefault();
            config.onSearch();
          }
          break;
        case 'e':
          if (config.onExport) {
            event.preventDefault();
            config.onExport();
          }
          break;
      }

      if (key === 'F11' && config.onFullScreen) {
        event.preventDefault();
        config.onFullScreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config]);
};
