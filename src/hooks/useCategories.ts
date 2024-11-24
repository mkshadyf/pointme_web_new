import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Category } from '../types/category';
import { CATEGORY_ICONS } from '../types/category';

export function useCategories() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const getCategoryById = (id: string) =>
    categories?.find(category => category.id === id);

  const getCategoryName = (id: string) =>
    getCategoryById(id)?.name || 'Unknown Category';

  const getCategoryIcon = (id: string) => {
    const category = getCategoryById(id);
    return category?.icon_name ? CATEGORY_ICONS[category.icon_name] : undefined;
  };

  return {
    categories,
    isLoading,
    error,
    getCategoryById,
    getCategoryName,
    getCategoryIcon,
  };
} 