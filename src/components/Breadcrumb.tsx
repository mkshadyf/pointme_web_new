import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../lib/utils';
import { navigationItems } from '../config/navigation';

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            className="text-gray-500 hover:text-primary-600"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            {item.href && index < items.length - 1 ? (
              <Link
                to={item.href}
                className="text-gray-500 hover:text-primary-600"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 