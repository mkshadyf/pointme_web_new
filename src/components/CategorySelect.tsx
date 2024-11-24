import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import type { Category } from '../lib/supabase';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export default function CategorySelect({ value, onChange, required, className }: CategorySelectProps) {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading categories...
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={`flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus:ring-primary-800 ${className}`}
    >
      <option value="">Select Category</option>
      {categories?.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
} 