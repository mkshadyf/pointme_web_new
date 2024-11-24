import { Home, Calendar, User, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function MobileNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="flex justify-around py-2">
        <Link
          to="/"
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/' ? 'text-primary-500' : 'text-gray-500'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </Link>

        <Link
          to="/bookings"
          className={`flex flex-col items-center p-2 ${
            location.pathname.includes('/bookings') ? 'text-primary-500' : 'text-gray-500'
          }`}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-xs">Bookings</span>
        </Link>

        <Link
          to="/nearby"
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/nearby' ? 'text-primary-500' : 'text-gray-500'
          }`}
        >
          <MapPin className="w-6 h-6" />
          <span className="text-xs">Nearby</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/profile' ? 'text-primary-500' : 'text-gray-500'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
} 