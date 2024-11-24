import { useSearchParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PaymentForm } from '../components/PaymentForm';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { BookingDetails } from '../types/booking';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Payment() {
  const [searchParams] = useSearchParams();
  const clientSecret = searchParams.get('client_secret');
  const bookingId = searchParams.get('booking_id');
  const navigate = useNavigate();

  const { data: booking, isLoading, error } = useQuery<BookingDetails>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error('Booking ID is required');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          service:services!inner (
            id,
            name,
            price,
            business:businesses (
              id,
              name,
              owner_id
            )
          ),
          start_time,
          end_time,
          status,
          payment_status,
          total_amount,
          client_id,
          provider_id,
          notes
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data as BookingDetails;
    },
    enabled: !!bookingId,
  });

  if (isLoading) return <LoadingState />;
  if (error || !booking) return <ErrorMessage error={error || new Error('Booking not found')} />;
  if (!clientSecret) return <ErrorMessage error={new Error('Invalid payment session')} />;

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-2">
            <h3 className="font-semibold">{booking.service.name}</h3>
            <div className="text-sm text-gray-600">
              <p>Date: {new Date(booking.start_time).toLocaleDateString()}</p>
              <p>
                Time: {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-2xl font-bold">${booking.total_amount}</div>
          </div>

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#0F172A',
                  colorBackground: '#ffffff',
                  colorText: '#1e293b',
                  colorDanger: '#ef4444',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  borderRadius: '0.5rem',
                  spacingUnit: '4px',
                },
              },
            }}
          >
            <PaymentForm
              bookingId={booking.id}
              amount={booking.total_amount}
              onSuccess={() => navigate('/payment/success')}
              onError={(error) => console.error('Payment failed:', error)}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
} 