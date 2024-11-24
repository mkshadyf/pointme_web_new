import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, Building2, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import type { Service } from '../../lib/supabase';

interface DashboardMetrics {
  total_users: number;
  total_bookings: number;
  total_businesses: number;
  total_revenue: number;
}

interface BookingWithService {
  services: {
    price: number;
  };
}

interface BookingResponse {
  services: {
    price: number;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch bookings count
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      // Fetch businesses count
      const { count: businessesCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

      // Fetch total revenue with proper typing
      const { data: revenueData } = await supabase
        .from('bookings')
        .select(`
          services:services (
            price
          )
        `)
        .eq('status', 'completed');

      const totalRevenue = ((revenueData as unknown) as BookingWithService[])
        ?.reduce((sum, booking) => sum + (booking.services?.price || 0), 0) ?? 0;

      return {
        total_users: usersCount || 0,
        total_bookings: bookingsCount || 0,
        total_businesses: businessesCount || 0,
        total_revenue: totalRevenue,
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Users',
      value: metrics?.total_users || 0,
      icon: <Users className="w-6 h-6 text-primary-600" />,
    },
    {
      title: 'Total Bookings',
      value: metrics?.total_bookings || 0,
      icon: <Calendar className="w-6 h-6 text-green-600" />,
    },
    {
      title: 'Active Businesses',
      value: metrics?.total_businesses || 0,
      icon: <Building2 className="w-6 h-6 text-purple-600" />,
    },
    {
      title: 'Total Revenue',
      value: `$${metrics?.total_revenue.toLocaleString()}`,
      icon: <BarChart3 className="w-6 h-6 text-orange-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {card.title}
                </CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add recent activity list here */}
          <p className="text-gray-600">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
} 