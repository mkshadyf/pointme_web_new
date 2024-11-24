import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigationItems } from '../config/navigation';

export function useKeyboardNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        const key = event.key.toLowerCase();

        // Find matching navigation item
        const item = navigationItems.find(item =>
          item.label.toLowerCase().startsWith(key)
        );

        if (item) {
          event.preventDefault();
          navigate(item.path);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
} 