import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/Button';

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Open command palette' },
    { keys: ['⌘', 'H'], description: 'Go to home' },
    { keys: ['⌘', 'S'], description: 'Go to services' },
    { keys: ['⌘', 'B'], description: 'Go to bookings/business' },
    { keys: ['⌘', 'A'], description: 'Go to admin (if admin)' },
    { keys: ['⌘', 'P'], description: 'Go to profile' },
    { keys: ['ESC'], description: 'Close dialogs' },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
        aria-label="Keyboard shortcuts"
      >
        <Keyboard className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[20vh] z-50 mx-auto max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800"
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">
                  Keyboard Shortcuts
                </h2>
                <div className="space-y-2">
                  {shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center space-x-1">
                        {shortcut.keys.map((key, index) => (
                          <kbd
                            key={index}
                            className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 