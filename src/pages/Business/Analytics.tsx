import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { PaymentAnalyticsDashboard } from '../../components/PaymentAnalyticsDashboard';
import { LoadingState } from '../../components/LoadingState';
import { ErrorMessage } from '../../components/ErrorMessage';

export default function BusinessAnalytics() {
  const { user } = useAuth();

  const { data: business, isLoading, error } = useQuery({
    queryKey: ['business', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorMessage error={error} />;
  if (!business) return <ErrorMessage error={new Error('Business not found')} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <PaymentAnalyticsDashboard businessId={business.id} />
    </div>
  );
} 