import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import type { BookingDetails } from '../types/booking';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('booking_id');

  // Redirect if no booking ID
  useEffect(() => {
    if (!bookingId) {
      navigate('/');
    }
  }, [bookingId, navigate]);

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
  if (error) return <ErrorMessage error={error} />;
  if (!booking) return <ErrorMessage error={new Error('Booking not found')} />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6"
      >
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/20"
            >
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </motion.div>

            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your booking has been confirmed and payment has been processed successfully.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-left dark:bg-gray-800">
              <h3 className="font-semibold">{booking.service.name}</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Date: {new Date(booking.start_time).toLocaleDateString()}</p>
                <p>
                  Time: {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
                </p>
                <p>Amount Paid: ${booking.total_amount}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Link to="/bookings">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  View My Bookings
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 