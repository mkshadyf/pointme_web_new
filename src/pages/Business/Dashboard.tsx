import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Business } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);

  const { isLoading } = useQuery({
    queryKey: ['business', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (error) throw error;
      setBusiness(data);
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading || !business) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {business.name}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Here's an overview of your business performance.
          </p>
          {/* Add business metrics here */}
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Fetch and display recent bookings */}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button>
          <Link to="/business/services" className="flex items-center">
            Manage Services
          </Link>
        </Button>
        <Button>
          <Link to="/business/bookings" className="flex items-center">
            View Bookings
          </Link>
        </Button>
        <Button>
          <Link to="/business/profile" className="flex items-center">
            Update Profile
          </Link>
        </Button>
      </div>
    </div>
  );
} 