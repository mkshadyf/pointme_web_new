import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { useAuth } from '../hooks/useAuth';

interface NavigationContextType {
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  isCommandPaletteOpen: boolean;
  navigateTo: (path: string) => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const openCommandPalette = () => {
    setIsCommandPaletteOpen(true);
    setIsMobileMenuOpen(false); // Close mobile menu when command palette opens
  };
  const closeCommandPalette = () => setIsCommandPaletteOpen(false);
  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
    setIsCommandPaletteOpen(false); // Close command palette when mobile menu opens
  };
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navigateTo = (path: string) => {
    navigate(path);
    closeCommandPalette();
    closeMobileMenu();
  };

  // Add keyboard shortcuts based on user role
  useKeyboardShortcut({
    'k': () => setIsCommandPaletteOpen(true),
    'escape': () => {
      setIsCommandPaletteOpen(false);
      setIsMobileMenuOpen(false);
    },
    '/': (e) => {
      e.preventDefault();
      setIsCommandPaletteOpen(true);
    },
    'h': () => navigateTo('/'),
    'b': () => {
      if (user?.role === 'client') navigateTo('/bookings');
      if (user?.role === 'provider') navigateTo('/business');
    },
    's': () => navigateTo('/services'),
    'p': () => user && navigateTo('/profile'),
    'a': () => {
      if (user?.role === 'admin' || user?.role === 'super_admin') {
        navigateTo('/admin');
      }
    },
  });

  return (
    <NavigationContext.Provider
      value={{
        openCommandPalette,
        closeCommandPalette,
        isCommandPaletteOpen,
        navigateTo,
        openMobileMenu,
        closeMobileMenu,
        isMobileMenuOpen,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
} 