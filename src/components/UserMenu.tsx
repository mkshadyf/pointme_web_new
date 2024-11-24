import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, UserCircle, Building2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { getInitials } from '../lib/utils';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, () => setIsOpen(false));

  // Add keyboard shortcuts
  useKeyboardShortcut({
    'k': () => setIsOpen(true), // Cmd/Ctrl + K to open menu
    'escape': () => setIsOpen(false), // Escape to close menu
    'p': () => user && navigate('/profile'), // Cmd/Ctrl + P to go to profile
    's': () => user && navigate('/settings'), // Cmd/Ctrl + S to go to settings
  });

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  const isProvider = user?.role === 'provider';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        className="flex items-center space-x-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.user_metadata?.full_name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {getInitials(user.user_metadata?.full_name || user.email || '')}
            </span>
          </div>
        )}
        <span className="text-sm text-gray-600">
          {user.user_metadata?.full_name || user.email}
        </span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
          >
            <div className="px-4 py-2 border-b dark:border-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.user_metadata?.full_name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>

            {(isProvider || isAdmin) && (
              <div className="py-1 border-b dark:border-gray-700">
                {isProvider && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/business');
                    }}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Business Dashboard
                  </Button>
                )}
                
                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/admin');
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
              </div>
            )}

            <div className="py-1">
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2 text-sm text-gray-700"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/profile');
                }}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Profile
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2 text-sm text-gray-700"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/settings');
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>

            <div className="border-t">
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:text-red-700"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 