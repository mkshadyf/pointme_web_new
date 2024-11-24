import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { PaymentStatus } from '../types/payment';

interface PaymentAnalytics {
  id: string;
  business_id: string;
  service_id: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method_type: string;
  customer_id: string;
  created_at: string;
}

interface PaymentMetrics {
  id: string;
  business_id: string;
  date: string;
  total_payments: number;
  total_amount: number;
  successful_payments: number;
  failed_payments: number;
  refunded_payments: number;
  average_amount: number;
}

interface DateRange {
  start: Date;
  end: Date;
}

export function usePaymentAnalytics(businessId: string | undefined, dateRange?: DateRange) {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<PaymentAnalytics[]>({
    queryKey: ['payment-analytics', businessId, dateRange],
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
    queryKey: ['payment-metrics', businessId, dateRange],
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

  return {
    analytics,
    metrics,
    isLoading: analyticsLoading || metricsLoading,
  };
} 