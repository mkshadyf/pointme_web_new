import { useMutation, useQuery } from '@tanstack/react-query';
import { createPaymentIntent } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import type { BookingDetails } from '../types/booking';

export function usePayment(bookingId?: string) {
  const { data: booking } = useQuery<BookingDetails>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error('Booking ID is required');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services!inner(
            id,
            name,
            price,
            business:businesses(*)
          )
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });

  const createIntent = useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!bookingId) throw new Error('Booking ID is required');
      return createPaymentIntent(bookingId, amount);
    },
  });

  const confirmPayment = useMutation({
    mutationFn: async ({ paymentIntentId }: { paymentIntentId: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({
          payment_status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (error) throw error;
    },
  });

  const processRefund = useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const { error } = await supabase.functions.invoke('process-refund', {
        body: { bookingId, amount },
      });

      if (error) throw error;
    },
  });

  return {
    booking,
    createIntent,
    confirmPayment,
    processRefund,
  };
} 