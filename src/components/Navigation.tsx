import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { navigationItems } from '../config/navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/Button';

export default function Navigation() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (path: string) => {
    setOpenMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const isActive = (path: string, matchExact = false) => {
    if (matchExact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const filteredItems = navigationItems.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const renderNavItem = (item: typeof navigationItems[0], isChild = false) => {
    const active = isActive(item.path, item.matchExact);
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.path);

    return (
      <div key={item.path} className={cn("relative", isChild && "ml-4")}>
        <Link
          to={hasChildren ? '#' : item.path}
          onClick={hasChildren ? () => toggleMenu(item.path) : undefined}
          className={cn(
            'flex items-center space-x-2 py-2 px-3 rounded-md transition-colors relative',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            active && 'text-primary-600 bg-primary-50 dark:bg-primary-900/10',
            hasChildren && 'cursor-pointer'
          )}
        >
          {item.icon && <item.icon className="w-5 h-5" />}
          <span>{item.label}</span>
          {hasChildren && (
            <ChevronDown 
              className={cn(
                "w-4 h-4 transition-transform ml-auto",
                isOpen && "transform rotate-180"
              )} 
            />
          )}
        </Link>

        {hasChildren && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="hidden md:flex items-center space-x-4">
      <div className="flex items-center space-x-1">
        {filteredItems.map(item => renderNavItem(item))}
      </div>

      {!user && (
        <div className="flex items-center space-x-4 ml-4 border-l pl-4">
          <Button 
            variant="ghost"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate('/onboarding')}
          >
            Sign Up
          </Button>
        </div>
      )}
    </nav>
  );
} 