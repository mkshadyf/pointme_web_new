import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import type { GroupBooking } from '../types/booking';
import { supabase } from '../lib/supabase';

export function GroupBookingForm({ serviceId }: { serviceId: string }) {
  const [participants, setParticipants] = useState<string[]>([]);
  const [maxParticipants, setMaxParticipants] = useState(5);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const createGroupBooking = useMutation({
    mutationFn: async (booking: Omit<GroupBooking, 'id' | 'status'>) => {
      const { data, error } = await supabase
        .from('group_bookings')
        .insert(booking)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGroupBooking.mutate({
      serviceId,
      participants,
      maxParticipants,
      startTime,
      endTime,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Group Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Maximum Participants</label>
            <Input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
              min={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <Input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <Input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={createGroupBooking.isPending}
          >
            {createGroupBooking.isPending ? 'Creating...' : 'Create Group Booking'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 