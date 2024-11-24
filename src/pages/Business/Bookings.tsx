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
import { WaitingList } from '../../components/WaitingList';
import toast from 'react-hot-toast';

const statusIcons = {
  pending: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  confirmed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  cancelled: <XCircle className="w-5 h-5 text-red-500" />,
  completed: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
};

export default function BusinessBookings() {
  const [selectedView, setSelectedView] = useState<'bookings' | 'resources' | 'waitlist'>('bookings');

  const { data: bookings, isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ['business-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (*),
          profiles!client_id(*),
          provider:profiles!provider_id(*)
        `)
        .order('start_time', { ascending: true });

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
          variant={selectedView === 'bookings' ? 'default' : 'outline'}
          onClick={() => setSelectedView('bookings')}
        >
          Bookings
        </Button>
        <Button
          variant={selectedView === 'resources' ? 'default' : 'outline'}
          onClick={() => setSelectedView('resources')}
        >
          Resources
        </Button>
        <Button
          variant={selectedView === 'waitlist' ? 'default' : 'outline'}
          onClick={() => setSelectedView('waitlist')}
        >
          Waiting List
        </Button>
      </div>

      {selectedView === 'bookings' && (
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

      {selectedView === 'resources' && <ResourceManagement />}
      
      {selectedView === 'waitlist' && (
        <div className="grid gap-4 md:grid-cols-2">
          {bookings?.[0]?.services && (
            <WaitingList serviceId={bookings[0].services.id} />
          )}
        </div>
      )}
    </div>
  );
} 