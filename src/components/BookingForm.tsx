import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { createPaymentIntent } from '../lib/stripe';
import { sendNotification } from '../lib/notifications';
import type { Tables } from '../lib/supabase';
import type { BookingForm as BookingFormType } from '../types/booking';
import { Calendar } from './ui/Calendar';
import { TimeSelect } from './ui/TimeSelect';
import { LoadingState } from './LoadingState';
import { ErrorMessage } from './ErrorMessage';

interface BookingFormProps {
  serviceId: string;
}

interface ServiceWithBusiness {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  business_id: string;
  business: Tables['businesses']['Row'];
}

export function BookingForm({ serviceId }: BookingFormProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [notes, setNotes] = useState('');

  // Fetch service details
  const { data: service, isLoading, error } = useQuery<ServiceWithBusiness>({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          business:businesses(*)
        `)
        .eq('id', serviceId)
        .single();
      if (error) throw error;
      return data as ServiceWithBusiness;
    },
  });

  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (booking: BookingFormType) => {
      if (!service || !user) throw new Error('Missing required data');

      // 1. Create payment intent
      const { clientSecret } = await createPaymentIntent(
        serviceId,
        service.price
      );

      // 2. Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          service_id: serviceId,
          client_id: user.id,
          provider_id: service.business.owner_id,
          start_time: booking.start_time,
          end_time: booking.end_time,
          notes: booking.notes,
          status: 'pending',
          payment_status: 'pending',
          payment_intent: clientSecret,
          total_amount: service.price,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 3. Send notifications
      await Promise.all([
        // Notify provider
        sendNotification({
          user_id: service.business.owner_id,
          type: 'booking_created',
          title: 'New Booking',
          message: `New booking for ${service.name}`,
          data: { booking_id: bookingData.id },
          read: false,
        }),
        // Notify client
        sendNotification({
          user_id: user.id,
          type: 'booking_created',
          title: 'Booking Confirmed',
          message: `Your booking for ${service.name} has been confirmed`,
          data: { booking_id: bookingData.id },
          read: false,
        }),
      ]);

      return { bookingData, clientSecret };
    },
    onSuccess: ({ clientSecret }) => {
      // Redirect to payment page
      window.location.href = `/payment?client_secret=${clientSecret}`;
    },
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorMessage error={error} />;
  if (!service) return <ErrorMessage error={new Error('Service not found')} />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    const startTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    startTime.setHours(parseInt(hours), parseInt(minutes));

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + service.duration);

    bookingMutation.mutate({
      service_id: serviceId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      notes,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book {service.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          
          <TimeSelect
            value={selectedTime}
            onChange={setSelectedTime}
            duration={service.duration}
            businessId={service.business_id}
            selectedDate={selectedDate}
          />

          <Input
            placeholder="Add notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Total</p>
              <p className="text-2xl font-bold">${service.price}</p>
            </div>
            <Button
              type="submit"
              disabled={!selectedDate || !selectedTime || bookingMutation.isPending}
            >
              {bookingMutation.isPending ? 'Processing...' : 'Book Now'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 