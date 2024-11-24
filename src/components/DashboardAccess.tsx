import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { Building2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DashboardAccess() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isProvider = user.role === 'provider';
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  if (!isProvider && !isAdmin) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 flex flex-col gap-2 z-50"
    >
      {isProvider && (
        <Button
          size="lg"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white"
          onClick={() => navigate('/business')}
        >
          <Building2 className="w-5 h-5" />
          Business Dashboard
        </Button>
      )}
      
      {isAdmin && (
        <Button
          size="lg"
          variant="outline"
          className="flex items-center gap-2 border-primary-600 text-primary-600 hover:bg-primary-50"
          onClick={() => navigate('/admin')}
        >
          <Settings className="w-5 h-5" />
          Admin Panel
        </Button>
      )}
    </motion.div>
  );
}