import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/LoadingScreen';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Tables } from '../lib/supabase';

type Service = Tables['services']['Row'];

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: service, isLoading, error } = useQuery<Service>({
    queryKey: ['service', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          business:businesses(*),
          category:categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorMessage error={error} />;
  if (!service) return <ErrorMessage error={new Error('Service not found')} />;

  return (
    <div>
      <h1>{service.name}</h1>
      {/* Add more service details */}
    </div>
  );
} 