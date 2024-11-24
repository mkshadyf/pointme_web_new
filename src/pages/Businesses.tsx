import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { BusinessCard } from '../components/BusinessCard';
import LoadingScreen from '../components/LoadingScreen';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Tables } from '../lib/supabase';

type Business = Tables['businesses']['Row'];

export default function Businesses() {
  const { data: businesses, isLoading, error } = useQuery<Business[]>({
    queryKey: ['businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('status', 'approved')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Businesses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses?.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    </div>
  );
} 