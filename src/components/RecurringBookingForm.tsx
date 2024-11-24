import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar } from './ui/Calendar';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import type { RecurringBooking } from '../types/booking';
import { supabase } from '../lib/supabase';

interface RecurringBookingFormProps {
  serviceId: string;
  onSuccess?: () => void;
}

export function RecurringBookingForm({ serviceId, onSuccess }: RecurringBookingFormProps) {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [timeOfDay, setTimeOfDay] = useState('09:00');

  const createRecurringBooking = useMutation({
    mutationFn: async (booking: Omit<RecurringBooking, 'id'>) => {
      const { data, error } = await supabase
        .from('recurring_bookings')
        .insert(booking)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    createRecurringBooking.mutate({
      serviceId,
      frequency,
      startDate: startDate.toISOString(),
      endDate: endDate?.toISOString(),
      daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined,
      timeOfDay,
      status: 'pending',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Recurring Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              className="rounded-md border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              className="rounded-md border"
            />
          </div>

          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium mb-1">Days of Week</label>
              <div className="flex gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <label key={day} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={daysOfWeek.includes(index)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDaysOfWeek([...daysOfWeek, index]);
                        } else {
                          setDaysOfWeek(daysOfWeek.filter(d => d !== index));
                        }
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <Input
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={!startDate || createRecurringBooking.isPending}
          >
            {createRecurringBooking.isPending ? 'Scheduling...' : 'Schedule Recurring Booking'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 