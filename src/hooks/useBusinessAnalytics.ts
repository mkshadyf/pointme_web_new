import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { AnalyticsDateRange, PaymentAnalytics, PaymentMetrics, ServiceAnalytics } from '../types/analytics';

export function useBusinessAnalytics(businessId: string | undefined, dateRange?: AnalyticsDateRange) {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<PaymentAnalytics[]>({
    queryKey: ['business-analytics', businessId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('payment_analytics')
        .select('*')
        .eq('business_id', businessId);

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<PaymentMetrics[]>({
    queryKey: ['business-metrics', businessId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('payment_metrics')
        .select('*')
        .eq('business_id', businessId);

      if (dateRange) {
        query = query
          .gte('date', dateRange.start.toISOString().split('T')[0])
          .lte('date', dateRange.end.toISOString().split('T')[0]);
      }

      const { data, error } = await query.order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const { data: serviceAnalytics, isLoading: serviceLoading } = useQuery<ServiceAnalytics[]>({
    queryKey: ['service-analytics', businessId, dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_service_analytics', {
        p_business_id: businessId,
        p_start_date: dateRange?.start.toISOString(),
        p_end_date: dateRange?.end.toISOString(),
      });

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  return {
    analytics,
    metrics,
    serviceAnalytics,
    isLoading: analyticsLoading || metricsLoading || serviceLoading,
  };
} 