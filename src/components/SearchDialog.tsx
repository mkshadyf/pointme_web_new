import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { navigationItems } from '../config/navigation';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { cn } from '../lib/utils';

export default function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useKeyboardShortcut({
    'k': () => setIsOpen(true),
  });

  const filteredItems = navigationItems
    .flatMap(item => [
      item,
      ...(item.children || []).map(child => ({
        ...child,
        parent: item.label,
      })),
    ])
    .filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      (item as any).parent?.toLowerCase().includes(query.toLowerCase())
    );

  const handleSelect = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 border rounded-md hover:border-gray-400 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Quick search...</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-gray-50 px-1.5 font-mono text-[10px] font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[25vh]"
      >
        <div className="fixed inset-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
        </div>

        <Dialog.Panel
          as={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative mx-auto max-w-xl rounded-xl bg-white shadow-2xl ring-1 ring-black/5"
        >
          <div className="flex items-center border-b p-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 border-0 bg-transparent px-4 focus:outline-none focus:ring-0"
              autoFocus
            />
            <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-gray-50 px-1.5 font-mono text-[10px] font-medium">
              ESC
            </kbd>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleSelect(item.path)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm",
                  "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                )}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <div>
                  <div className="font-medium">{item.label}</div>
                  {(item as any).parent && (
                    <div className="text-xs text-gray-500">
                      {(item as any).parent}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
} 