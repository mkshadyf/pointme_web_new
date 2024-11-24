import { useEffect } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;
type KeyMap = { [key: string]: KeyHandler };

export function useKeyboardShortcut(keyMap: KeyMap) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const handler = keyMap[key];

      if (handler && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyMap]);
} 