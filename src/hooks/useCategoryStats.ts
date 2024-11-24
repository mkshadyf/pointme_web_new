import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { CategoryStats } from '../types/category';

export function useCategoryStats() {
  const { data: stats, isLoading, error } = useQuery<CategoryStats[]>({
    queryKey: ['category-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_category_stats');

      if (error) throw error;
      return data as CategoryStats[];
    },
  });

  const getCategoryStats = (categoryId: string) =>
    stats?.find(stat => stat.category_id === categoryId);

  const getTotalServices = () =>
    stats?.reduce((acc, curr) => acc + Number(curr.count), 0) || 0;

  const getAveragePrice = () => {
    if (!stats?.length) return 0;
    const total = stats.reduce((acc, curr) => acc + curr.avg_price, 0);
    return total / stats.length;
  };

  const getTotalRevenue = () =>
    stats?.reduce((acc, curr) => acc + curr.total_revenue, 0) || 0;

  const getActiveServices = () =>
    stats?.reduce((acc, curr) => acc + curr.active_services, 0) || 0;

  return {
    stats,
    isLoading,
    error,
    getCategoryStats,
    getTotalServices,
    getAveragePrice,
    getTotalRevenue,
    getActiveServices,
  };
} 