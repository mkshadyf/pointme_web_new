import { Link } from 'react-router-dom';
import { MapPin, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <motion.nav 
      className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/80"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <MapPin className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-semibold">PointMe</span>
          </Link>

          <div className="flex items-center space-x-8">
            <Link to="/services" className="text-gray-600 hover:text-blue-600 transition-colors">
              Services
            </Link>
            {user ? (
              <>
                <Link to="/bookings" className="text-gray-600 hover:text-blue-600 transition-colors">
                  My Bookings
                </Link>
                {user.user_metadata?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={signOut}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Button asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}