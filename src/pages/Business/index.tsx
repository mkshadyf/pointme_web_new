import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import BusinessDashboard from './Dashboard';
import BusinessServices from './Services';
import BusinessBookings from './Bookings';
import BusinessProfile from './Profile';
import BusinessStaff from './Staff';
import BusinessAnalytics from './Analytics';
import BusinessSettings from './Settings';
import BusinessSchedule from './Schedule';

export default function Business() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Routes>
        <Route index element={<BusinessDashboard />} />
        <Route path="services/*" element={<BusinessServices />} />
        <Route path="bookings" element={<BusinessBookings />} />
        <Route path="profile" element={<BusinessProfile />} />
        <Route path="staff" element={<BusinessStaff />} />
        <Route path="analytics" element={<BusinessAnalytics />} />
        <Route path="settings" element={<BusinessSettings />} />
        <Route path="schedule" element={<BusinessSchedule />} />
      </Routes>
    </motion.div>
  );
} 