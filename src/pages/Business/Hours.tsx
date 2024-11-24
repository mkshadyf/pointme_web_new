import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import type { Business } from '../../lib/supabase';

interface BusinessHours {
  id: string;
  business_id: string;
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  is_closed: boolean;
}

interface ScheduleForm {
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  is_closed: boolean;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function BusinessHours() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [business, setBusiness] = useState<Business | null>(null);
  const [schedules, setSchedules] = useState<ScheduleForm[]>([]);

  // Fetch business data
  const { isLoading: businessLoading } = useQuery({
    queryKey: ['business', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user?.id)
        .single();
      if (error) throw error;
      setBusiness(data);
      return data;
    },
    enabled: !!user?.id,
  });

  // Initialize schedules with default values
  useEffect(() => {
    if (business) {
      const defaultSchedules = DAYS_OF_WEEK.map((_, index) => ({
        day_of_week: index,
        start_time: '09:00',
        end_time: '17:00',
        is_closed: false,
      }));
      setSchedules(defaultSchedules);
    }
  }, [business]);

  const updateMutation = useMutation({
    mutationFn: async (updatedSchedules: ScheduleForm[]) => {
      const { error } = await supabase
        .from('business_hours')
        .upsert(
          updatedSchedules.map(schedule => ({
            ...schedule,
            business_id: business?.id,
          }))
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['business-hours', business?.id] 
      });
      toast.success('Schedule updated successfully');
    },
    onError: () => {
      toast.error('Failed to update schedule');
    },
  });

  if (businessLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate(schedules);
            }}
            className="space-y-4"
          >
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className="grid grid-cols-3 gap-4 items-center">
                <span className="font-medium">{day}</span>
                <div className="col-span-2 flex gap-4 items-center">
                  <input
                    type="time"
                    value={schedules[index]?.start_time || '09:00'}
                    onChange={(e) => {
                      const newSchedules = [...schedules];
                      newSchedules[index] = {
                        ...newSchedules[index],
                        start_time: e.target.value,
                      };
                      setSchedules(newSchedules);
                    }}
                    className="border rounded px-2 py-1"
                    disabled={schedules[index]?.is_closed}
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={schedules[index]?.end_time || '17:00'}
                    onChange={(e) => {
                      const newSchedules = [...schedules];
                      newSchedules[index] = {
                        ...newSchedules[index],
                        end_time: e.target.value,
                      };
                      setSchedules(newSchedules);
                    }}
                    className="border rounded px-2 py-1"
                    disabled={schedules[index]?.is_closed}
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={schedules[index]?.is_closed}
                      onChange={(e) => {
                        const newSchedules = [...schedules];
                        newSchedules[index] = {
                          ...newSchedules[index],
                          is_closed: e.target.checked,
                        };
                        setSchedules(newSchedules);
                      }}
                    />
                    Closed
                  </label>
                </div>
              </div>
            ))}
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Save Hours
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 