import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface ReportScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  days?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  timezone?: string;
  repeat_interval?: number;
  format?: 'pdf' | 'csv' | 'excel';
  include_charts?: boolean;
  notify_on_completion?: boolean;
}

interface ReportSchedule {
  id: string;
  business_id: string;
  report_type: 'payment_analytics' | 'customer_analytics' | 'service_analytics';
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  schedule_config: ReportScheduleConfig;
  last_run?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useReportSchedules(businessId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery<ReportSchedule[]>({
    queryKey: ['report-schedules', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_schedules')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const createSchedule = useMutation({
    mutationFn: async (schedule: Omit<ReportSchedule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('report_schedules')
        .insert(schedule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules', businessId] });
      toast.success('Report schedule created successfully');
    },
    onError: (error) => {
      console.error('Error creating report schedule:', error);
      toast.error('Failed to create report schedule');
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async (schedule: Partial<ReportSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('report_schedules')
        .update({
          ...schedule,
          updated_at: new Date().toISOString(),
        })
        .eq('id', schedule.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules', businessId] });
      toast.success('Report schedule updated successfully');
    },
    onError: (error) => {
      console.error('Error updating report schedule:', error);
      toast.error('Failed to update report schedule');
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('report_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules', businessId] });
      toast.success('Report schedule deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting report schedule:', error);
      toast.error('Failed to delete report schedule');
    },
  });

  const getScheduleHistory = async (scheduleId: string) => {
    const { data, error } = await supabase
      .from('report_schedule_history')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('run_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  };

  return {
    schedules,
    isLoading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getScheduleHistory,
  };
} 