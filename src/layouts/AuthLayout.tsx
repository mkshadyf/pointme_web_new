import { motion } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import ThemeToggle from '../components/ThemeToggle';

export default function AuthLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="py-4 px-4 border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group w-fit">
            <MapPin className="w-6 h-6 text-primary-600 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-semibold dark:text-white">PointMe</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border-t">
        <p>&copy; {new Date().getFullYear()} PointMe. All rights reserved.</p>
      </footer>
    </div>
  );
} 