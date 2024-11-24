import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { BusinessCard } from '../components/BusinessCard';
import LoadingScreen from '../components/LoadingScreen';
import { ErrorMessage } from '../components/ErrorMessage';
import { CATEGORY_ICONS } from '../types/category';
import type { Tables } from '../lib/supabase';

type Category = Tables['categories']['Row'];
type Business = Tables['businesses']['Row'];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: category } = useQuery<Category>({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: businesses, isLoading, error } = useQuery<Business[]>({
    queryKey: ['category-businesses', category?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          services!inner(
            id,
            category_id
          )
        `)
        .eq('services.category_id', category?.id)
        .eq('status', 'approved');

      if (error) throw error;
      return data;
    },
    enabled: !!category?.id,
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl">
          {category?.icon_name && CATEGORY_ICONS[category.icon_name]}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{category?.name}</h1>
          <p className="text-gray-600">{category?.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses?.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    </div>
  );
} 