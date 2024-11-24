import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, Building2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import type { BookingWithDetails } from '../../types/booking';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ResourceManagement } from '../../components/ResourceManagement';
import toast from 'react-hot-toast';

const statusIcons = {
  pending: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  confirmed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  cancelled: <XCircle className="w-5 h-5 text-red-500" />,
  completed: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
};

export default function AdminBookings() {
  const [view, setView] = useState<'bookings' | 'resources'>('bookings');

  const { data: bookings, isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (*),
          profiles!client_id(*),
          provider:profiles!provider_id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <Button
          variant={view === 'bookings' ? 'default' : 'outline'}
          onClick={() => setView('bookings')}
        >
          All Bookings
        </Button>
        <Button
          variant={view === 'resources' ? 'default' : 'outline'}
          onClick={() => setView('resources')}
        >
          Resource Management
        </Button>
      </div>

      {view === 'bookings' && (
        <div className="grid gap-4">
          {bookings?.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{booking.services.name}</h3>
                    <p className="text-sm text-gray-600">
                      <Calendar className="inline-block w-4 h-4 mr-1" />
                      {format(new Date(booking.start_time), 'PPP')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <Clock className="inline-block w-4 h-4 mr-1" />
                      {format(new Date(booking.start_time), 'p')} - {format(new Date(booking.end_time), 'p')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <User className="inline-block w-4 h-4 mr-1" />
                      {booking.profiles.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <Building2 className="inline-block w-4 h-4 mr-1" />
                      {booking.provider.full_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcons[booking.status as keyof typeof statusIcons]}
                    <span className="text-sm font-medium capitalize">{booking.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {view === 'resources' && <ResourceManagement />}
    </div>
  );
} 