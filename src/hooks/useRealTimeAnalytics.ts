import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { realTimeAnalytics } from '../services/realTimeAnalytics';

interface AnalyticsOptions {
  businessId: string;
  eventTypes: string[];
  timeframe?: 'hour' | 'day' | 'week' | 'month';
}

export function useRealTimeAnalytics({ businessId, eventTypes, timeframe = 'hour' }: AnalyticsOptions) {
  const [realtimeData, setRealtimeData] = useState<any[]>([]);

  // Fetch historical data
  const { data: historicalData } = useQuery({
    queryKey: ['analytics', businessId, eventTypes, timeframe],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hourly_analytics')
        .select('*')
        .eq('business_id', businessId)
        .in('event_type', eventTypes)
        .gte('hour', new Date(Date.now() - getTimeframeMs(timeframe)));

      if (error) throw error;
      return data;
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    realTimeAnalytics.subscribe({
      businessId,
      eventTypes,
      callback: (event) => {
        setRealtimeData(prev => [...prev, event]);
      },
    });

    return () => {
      realTimeAnalytics.unsubscribe(businessId, setRealtimeData);
    };
  }, [businessId, eventTypes]);

  // Combine historical and real-time data
  const combinedData = [...(historicalData || []), ...realtimeData];

  return {
    data: combinedData,
    isLoading: !historicalData,
  };
}

function getTimeframeMs(timeframe: string): number {
  const hour = 3600000;
  switch (timeframe) {
    case 'hour': return hour;
    case 'day': return hour * 24;
    case 'week': return hour * 24 * 7;
    case 'month': return hour * 24 * 30;
    default: return hour;
  }
} 