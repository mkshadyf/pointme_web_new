import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function useCommandShortcuts() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if Cmd/Ctrl is pressed
      if (!e.metaKey && !e.ctrlKey) return;

      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          if (user?.role === 'provider') {
            navigate('/business');
          }
          break;
        case 'a':
          e.preventDefault();
          if (user?.role === 'admin' || user?.role === 'super_admin') {
            navigate('/admin');
          }
          break;
        case 'h':
          e.preventDefault();
          navigate('/');
          break;
        case 's':
          e.preventDefault();
          navigate('/services');
          break;
        case 'p':
          e.preventDefault();
          navigate('/profile');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, user]);
} 