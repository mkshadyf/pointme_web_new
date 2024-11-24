import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Booking, Service, Profile } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

type BookingWithDetails = Booking & {
  services: Service;
  profiles: Profile;
};

export default function BusinessBookings() {
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ['business-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (*),
          profiles!bookings_client_id_fkey (*)
        `)
        .eq('provider_id', user?.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
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
          <CardTitle>Your Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {bookings?.map((booking) => (
              <div key={booking.id} className="border rounded-md p-4">
                <h3 className="font-bold">{booking.services.name}</h3>
                <p className="text-sm text-gray-600">
                  <CalendarIcon className="inline-block w-4 h-4 mr-1" />
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 