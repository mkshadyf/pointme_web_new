import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useNavigation } from '../contexts/NavigationContext';
import { navigationItems } from '../config/navigation';
import { useAuth } from '../hooks/useAuth';

export default function NavigationMenu() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (path: string) => {
    setOpenMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const filteredItems = navigationItems.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        {filteredItems.map(item => (
          <div key={item.path} className="relative group">
            {item.children ? (
              <button
                onClick={() => toggleMenu(item.path)}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-md transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  openMenus.includes(item.path) && 'bg-gray-100 dark:bg-gray-800'
                )}
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                <span>{item.label}</span>
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform',
                  openMenus.includes(item.path) && 'transform rotate-180'
                )} />
              </button>
            ) : (
              <Link
                to={item.path}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-md transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                <span>{item.label}</span>
              </Link>
            )}

            {/* Dropdown Menu */}
            <AnimatePresence>
              {item.children && openMenus.includes(item.path) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div className="py-1">
                    {item.children.map(child => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          'flex items-center space-x-2 px-4 py-2 text-sm',
                          'hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                      >
                        {child.icon && <child.icon className="w-4 h-4" />}
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
} 