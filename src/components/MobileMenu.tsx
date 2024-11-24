import { useState, useRef } from 'react';
import { Menu, X, User, LogOut, Settings, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { getInitials } from '../lib/utils';
import { navigationItems } from '../config/navigation';
import { cn } from '../lib/utils';
import { useNavigation } from '../contexts/NavigationContext';

export default function MobileMenu() {
  const { user, signOut } = useAuth();
  const { 
    navigateTo, 
    isMobileMenuOpen, 
    openMobileMenu, 
    closeMobileMenu 
  } = useNavigation();
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, closeMobileMenu);

  const handleNavigation = (path: string) => {
    navigateTo(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigateTo('/');
  };

  const filteredItems = navigationItems.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const renderNavItem = (item: typeof navigationItems[0], depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    return (
      <div key={item.path} style={{ marginLeft: `${depth * 1}rem` }}>
        <Button
          variant="ghost"
          onClick={() => handleNavigation(item.path)}
          className={cn(
            "w-full justify-start text-gray-600 hover:text-primary-600",
            "flex items-center space-x-2"
          )}
        >
          {Icon && <Icon className="w-4 h-4" />}
          <span>{item.label}</span>
        </Button>

        {hasChildren && item.children && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="md:hidden" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => isMobileMenuOpen ? closeMobileMenu() : openMobileMenu()}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 border-b shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              {!user ? (
                <div className="flex flex-col space-y-2 mb-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Get started with PointMe
                  </div>
                  <Button
                    onClick={() => handleNavigation('/login')}
                    variant="ghost"
                    className="w-full justify-center"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => handleNavigation('/onboarding')}
                    className="w-full justify-center"
                  >
                    Sign Up
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b dark:border-gray-700">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.user_metadata?.full_name || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {getInitials(user.user_metadata?.full_name || user.email || '')}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium dark:text-white">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {filteredItems.map(item => renderNavItem(item))}
              </div>

              {user && (
                <div className="mt-6 pt-4 border-t dark:border-gray-700 space-y-1">
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/profile')}
                    className="w-full justify-start"
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/settings')}
                    className="w-full justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 