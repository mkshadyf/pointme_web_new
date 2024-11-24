import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showMenu?: boolean;
}

export function MobileLayout({ children, title, showBackButton, showMenu }: MobileLayoutProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 h-14">
          {showBackButton && (
            <button onClick={() => navigate(-1)} className="p-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
          {showMenu && (
            <button onClick={() => setIsMenuOpen(true)} className="p-2">
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      {!isOnline && (
        <div className="fixed top-14 left-0 right-0 bg-yellow-500 text-white text-center py-1 text-sm">
          You're offline. Some features may be limited.
        </div>
      )}

      <main className="pt-14 pb-16">
        {children}
      </main>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-50 bg-white"
          >
            {/* Mobile menu content */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 