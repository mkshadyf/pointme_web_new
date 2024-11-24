import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import NavigationMenu from './NavigationMenu';
import MobileMenu from './MobileMenu';
import UserMenu from './UserMenu';
import CommandPalette from './CommandPalette';
import { cn } from '../lib/utils';
import { useScrollPosition } from '../hooks/useScrollPosition';
import ThemeToggle from './ThemeToggle';
import { useNavigation } from '../contexts/NavigationContext';

export default function Navbar() {
  const scrolled = useScrollPosition(50);
  const { openCommandPalette } = useNavigation();

  return (
    <motion.nav 
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
        "transition-all duration-200",
        scrolled && "border-b shadow-sm dark:border-gray-800"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
            aria-label="Home"
          >
            <MapPin className="w-6 h-6 text-primary-600 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-semibold dark:text-white">PointMe</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <NavigationMenu />
            <CommandPalette />
            <ThemeToggle />
            <UserMenu />
          </div>

          <MobileMenu />
        </div>
      </div>
    </motion.nav>
  );
}