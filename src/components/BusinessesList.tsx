import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from './ui/Card';
import type { Business } from '../lib/supabase';

interface BusinessWithServices extends Business {
  services: {
    count: number;
  }[];
}

export default function BusinessesList() {
  const { data: businesses, isLoading, error, isError } = useQuery<BusinessWithServices[]>({
    queryKey: ['featured-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          services:services(count)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }

      if (!data) return [];
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-md mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Failed to load businesses</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-primary-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!businesses?.length) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No businesses available at the moment
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {businesses.map((business) => (
        <Card key={business.id}>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{business.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {business.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {business.services[0]?.count || 0} services
              </span>
              <span className="text-sm text-gray-500">
                {business.address}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 