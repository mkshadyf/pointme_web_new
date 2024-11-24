import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import type { WaitlistEntry } from '../types/booking';
import { supabase } from '../lib/supabase';

export function WaitingList({ serviceId }: { serviceId: string }) {
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');

  const { data: waitlistEntries } = useQuery({
    queryKey: ['waitlist', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waiting_list')
        .select('*')
        .eq('service_id', serviceId)
        .eq('status', 'pending');

      if (error) throw error;
      return data;
    },
  });

  const addToWaitlist = useMutation({
    mutationFn: async (entry: Omit<WaitlistEntry, 'id' | 'status' | 'notifiedAt'>) => {
      const { data, error } = await supabase
        .from('waiting_list')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToWaitlist.mutate({
      serviceId,
      preferredDate,
      preferredTime,
      notes,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Waiting List</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Date</label>
            <Input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preferred Time</label>
            <Input
              type="time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or preferences"
            />
          </div>

          <Button
            type="submit"
            disabled={addToWaitlist.isPending}
          >
            {addToWaitlist.isPending ? 'Joining...' : 'Join Waiting List'}
          </Button>
        </form>

        {waitlistEntries && waitlistEntries.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Current Waiting List</h3>
            <div className="space-y-2">
              {waitlistEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 border rounded-md"
                >
                  <p className="font-medium">
                    {new Date(entry.preferredDate).toLocaleDateString()}
                    {' at '}
                    {entry.preferredTime}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-gray-600">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 