import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import LoadingScreen from '../components/LoadingScreen';
import { ErrorMessage } from '../components/ErrorMessage';
import { CATEGORY_ICONS } from '../types/category';
import type { Tables } from '../lib/supabase';

type Category = Tables['categories']['Row'];

export default function Categories() {
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

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categories</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories?.map((category) => (
          <Link key={category.id} to={`/categories/${category.slug}`}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">
                  {category.icon_name && CATEGORY_ICONS[category.icon_name]}
                </div>
                <h2 className="font-semibold mb-2">{category.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 