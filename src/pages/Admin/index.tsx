import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Users as UsersIcon, Grid, Calendar } from 'lucide-react';
import Categories from './Categories';
import Services from './Services';
import UserManagement from './UserManagement';
import Bookings from './Bookings';
import { Card } from '../../components/ui/Card';

export default function Admin() {
  const menuItems = [
    { icon: Grid, label: 'Categories', path: 'categories' },
    { icon: Settings, label: 'Services', path: 'services' },
    { icon: UsersIcon, label: 'Users', path: 'users' },
    { icon: Calendar, label: 'Bookings', path: 'bookings' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your platform's content and users</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={item.path}>
              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center space-y-2">
                  <item.icon className="w-8 h-8 text-blue-600" />
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <Routes>
          <Route path="categories" element={<Categories />} />
          <Route path="services" element={<Services />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="bookings" element={<Bookings />} />
        </Routes>
      </div>
    </div>
  );
}