import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command } from 'lucide-react';
import { navigationItems } from '../config/navigation';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { cn } from '../lib/utils';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { useNavigation } from '../contexts/NavigationContext';

export default function CommandPalette() {
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette, navigateTo } = useNavigation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commandRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => 
    navigationItems
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
      ),
    [query]
  );

  useOnClickOutside(commandRef, () => closeCommandPalette());

  useKeyboardShortcut({
    'k': () => {
      openCommandPalette();
      setTimeout(() => inputRef.current?.focus(), 100);
    },
  });

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCommandPalette();
        setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => 
            i < filteredItems.length - 1 ? i + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => 
            i > 0 ? i - 1 : filteredItems.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            navigateTo(filteredItems[selectedIndex].path);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, selectedIndex]);

  const handleSelect = (path: string) => {
    closeCommandPalette();
    setQuery('');
    navigateTo(path);
  };

  return (
    <>
      <button
        onClick={() => openCommandPalette()}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 border rounded-md hover:border-gray-400 transition-colors dark:text-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
      >
        <Search className="w-4 h-4" />
        <span>Quick search...</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-gray-50 px-1.5 font-mono text-[10px] font-medium dark:bg-gray-800 dark:border-gray-700">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <AnimatePresence>
        {isCommandPaletteOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => closeCommandPalette()}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Command palette */}
            <motion.div
              ref={commandRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[20vh] z-50 mx-auto max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/5"
            >
              <div className="flex items-center border-b p-4 dark:border-gray-700">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Search..."
                  className="flex-1 border-0 bg-transparent px-4 focus:outline-none focus:ring-0 dark:text-white"
                  autoFocus
                />
                <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-gray-50 px-1.5 font-mono text-[10px] font-medium dark:bg-gray-700 dark:border-gray-600">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredItems.map((item, index) => (
                  <button
                    key={item.path}
                    onClick={() => handleSelect(item.path)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm",
                      "transition-colors duration-75",
                      selectedIndex === index 
                        ? "bg-primary-50 text-primary-900 dark:bg-primary-900/10 dark:text-primary-100" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-700",
                      "focus:outline-none"
                    )}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <div>
                      <div className="font-medium dark:text-white">{item.label}</div>
                      {(item as any).parent && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {(item as any).parent}
                        </div>
                      )}
                    </div>
                  </button>
                ))}

                {filteredItems.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No results found.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 