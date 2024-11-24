import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import type { Category } from '../lib/supabase';

interface CategoryBadgeProps {
  categoryId: string;
  className?: string;
}

export default function CategoryBadge({ categoryId, className }: CategoryBadgeProps) {
  const { data: category } = useQuery<Category>({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (!category) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        "bg-primary-100 text-primary-800 dark:bg-primary-900/10 dark:text-primary-400",
        className
      )}
    >
      {category.icon && (
        <span className="text-primary-500 dark:text-primary-400">
          {category.icon}
        </span>
      )}
      {category.name}
    </div>
  );
} 