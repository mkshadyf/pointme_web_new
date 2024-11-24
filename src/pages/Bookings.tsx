import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingScreen from '../components/LoadingScreen';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Tables } from '../lib/supabase';

type Booking = Tables['bookings']['Row'];

interface BookingWithDetails extends Booking {
  service: {
    name: string;
    business: {
      name: string;
    };
  };
}

export default function Bookings() {
  const { user } = useAuth();

  const { data: bookings, isLoading, error } = useQuery<BookingWithDetails[]>({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(
            name,
            business:businesses(name)
          )
        `)
        .eq('client_id', user?.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Bookings</h1>
      <div className="grid gap-6">
        {bookings?.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-2">{booking.service.name}</h2>
              <p className="text-gray-600">{booking.service.business.name}</p>
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.start_time).toLocaleString()}
                  </p>
                  <p className="text-sm font-medium capitalize">
                    Status: {booking.status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}