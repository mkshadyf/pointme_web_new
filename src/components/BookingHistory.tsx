import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { CustomerReview } from './CustomerReview';
import { supabase } from '../lib/supabase';
import { Star } from 'lucide-react';

export function BookingHistory() {
  const { data: bookings } = useQuery({
    queryKey: ['booking-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(*),
          provider:profiles!provider_id(*),
          review:customer_reviews(*)
        `)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {bookings?.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{booking.service.name}</h3>
                <p className="text-sm text-gray-600">
                  {format(new Date(booking.start_time), 'PPP p')}
                </p>
                <p className="text-sm text-gray-600">
                  Provider: {booking.provider.full_name}
                </p>
                <p className="text-sm font-medium capitalize">
                  Status: {booking.status}
                </p>
              </div>
            </div>

            {booking.status === 'completed' && !booking.review && (
              <div className="mt-4">
                <CustomerReview
                  serviceId={booking.service.id}
                  providerId={booking.provider.id}
                  bookingId={booking.id}
                />
              </div>
            )}

            {booking.review && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="font-medium">Your Review</p>
                <div className="flex gap-1 my-2">
                  {Array.from({ length: booking.review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-600">{booking.review.review_text}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 