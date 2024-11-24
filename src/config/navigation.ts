import {
  BarChart2, Building2, Calendar, Clock, FileText,
  Home,
  Search,
  Settings, Users
} from 'lucide-react';

export interface NavigationItem {
  path: string;
  label: string;
  icon?: any;
  roles?: string[];
  matchExact?: boolean;
  children?: Omit<NavigationItem, 'children'>[];
  description?: string; // For accessibility and tooltips
  shortcut?: string; // For keyboard shortcuts
}

export const navigationItems: NavigationItem[] = [
  {
    path: '/',
    label: 'Home',
    icon: Home,
    matchExact: true,
    description: 'Return to homepage',
    shortcut: '⌘H'
  },
  {
    path: '/services',
    label: 'Services',
    icon: FileText,
    description: 'Browse all services',
    shortcut: '⌘S'
  },
  {
    path: '/search',
    label: 'Search',
    icon: Search,
    description: 'Search services and businesses',
    shortcut: '⌘K'
  },
  {
    path: '/bookings',
    label: 'My Bookings',
    icon: Calendar,
    roles: ['client'],
    description: 'View your bookings',
    shortcut: '⌘B'
  },
  {
    path: '/business',
    label: 'Business Dashboard',
    icon: Building2,
    roles: ['provider'],
    description: 'Manage your business',
    shortcut: '⌘D',
    children: [
      {
        path: '/business/services',
        label: 'Services',
        icon: FileText,
        description: 'Manage your services'
      },
      {
        path: '/business/bookings',
        label: 'Bookings',
        icon: Calendar,
        description: 'Manage bookings'
      },
      {
        path: '/business/staff',
        label: 'Staff',
        icon: Users,
        description: 'Manage staff members'
      },
      {
        path: '/business/schedule',
        label: 'Schedule',
        icon: Clock,
        description: 'Manage business hours'
      },
      {
        path: '/business/analytics',
        label: 'Analytics',
        icon: BarChart2,
        description: 'View business analytics'
      },
      {
        path: '/business/settings',
        label: 'Settings',
        icon: Settings,
        description: 'Business settings'
      },
    ]
  },
  {
    path: '/admin',
    label: 'Admin Dashboard',
    icon: Settings,
    roles: ['admin', 'super_admin'],
    description: 'Admin controls',
    shortcut: '⌘A',
    children: [
      {
        path: '/admin/users',
        label: 'Users',
        icon: Users,
        description: 'Manage users'
      },
      {
        path: '/admin/services',
        label: 'Services',
        icon: FileText,
        description: 'Manage services'
      },
      {
        path: '/admin/bookings',
        label: 'Bookings',
        icon: Calendar,
        description: 'Manage bookings'
      },
      {
        path: '/admin/analytics',
        label: 'Analytics',
        icon: BarChart2,
        description: 'View analytics'
      },
    ]
  },
];

// Helper functions for navigation
export function getNavigationItemByPath(path: string): NavigationItem | undefined {
  return navigationItems.find(item =>
    item.path === path || item.children?.some(child => child.path === path)
  );
}

export function getBreadcrumbItems(path: string): NavigationItem[] {
  const items: NavigationItem[] = [];
  const parts = path.split('/').filter(Boolean);
  let currentPath = '';

  parts.forEach(part => {
    currentPath += `/${part}`;
    const item = getNavigationItemByPath(currentPath);
    if (item) items.push(item);
  });

  return items;
}

export function isRouteAccessible(path: string, userRole?: string): boolean {
  const item = getNavigationItemByPath(path);
  if (!item) return true; // If no item found, assume public route
  if (!item.roles) return true; // If no roles specified, route is public
  return userRole ? item.roles.includes(userRole) : false;
} 