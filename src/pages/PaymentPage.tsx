import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PaymentForm } from '../components/PaymentForm';
import { PaymentMethods } from '../components/PaymentMethods';
import { AddPaymentMethod } from '../components/AddPaymentMethod';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import type { PaymentMethod } from '../types/payment';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface BookingDetails {
  id: string;
  service: {
    name: string;
    price: number;
  };
  start_time: string;
  end_time: string;
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const clientSecret = searchParams.get('client_secret');
  const bookingId = searchParams.get('booking_id');
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);

  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery<BookingDetails>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          service:services (
            name,
            price
          ),
          start_time,
          end_time
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !booking) {
    return <ErrorMessage error={error || new Error('Booking not found')} />;
  }

  if (!clientSecret) {
    return <ErrorMessage error={new Error('Invalid payment session')} />;
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="space-y-6">
        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{booking.service.name}</h3>
              <div className="text-sm text-gray-600">
                <p>Date: {new Date(booking.start_time).toLocaleDateString()}</p>
                <p>
                  Time: {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-2xl font-bold mt-4">${booking.service.price}</div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentMethods
              onSelect={setSelectedPaymentMethod}
              selectedId={selectedPaymentMethod?.id}
            />
          </CardContent>
        </Card>

        {/* Payment Form */}
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
            amount={booking.service.price}
            paymentMethod={selectedPaymentMethod}
            onSuccess={() => navigate('/payment/success')}
            onError={(error) => console.error('Payment failed:', error)}
          />
        </Elements>
      </div>

      {/* Add Payment Method Dialog */}
      <Dialog
        open={isAddingPaymentMethod}
        onClose={() => setIsAddingPaymentMethod(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            as={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl"
          >
            <AddPaymentMethod
              onSuccess={() => setIsAddingPaymentMethod(false)}
              onCancel={() => setIsAddingPaymentMethod(false)}
            />
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 