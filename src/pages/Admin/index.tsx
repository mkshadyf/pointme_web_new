import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './Dashboard';
import Categories from './Categories';
import Services from './Services';
import UserManagement from './UserManagement';
import Bookings from './Bookings';
import AdminManagement from './AdminManagement';

export default function Admin() {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="categories" element={<Categories />} />
      <Route path="services" element={<Services />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="admins" element={<AdminManagement />} />
    </Routes>
  );
}