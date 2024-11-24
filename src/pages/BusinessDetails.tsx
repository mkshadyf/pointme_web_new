import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/LoadingScreen';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Tables } from '../lib/supabase';

type Business = Tables['businesses']['Row'];

export default function BusinessDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: business, isLoading, error } = useQuery<Business>({
    queryKey: ['business', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          services(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorMessage error={error} />;
  if (!business) return <ErrorMessage error={new Error('Business not found')} />;

  return (
    <div>
      <h1>{business.name}</h1>
      {/* Add more business details */}
    </div>
  );
} 