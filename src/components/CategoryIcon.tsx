import { cn } from '../lib/utils';
import { useCategory } from '../contexts/CategoryContext';
import { CATEGORY_ICONS } from '../types/category';

interface CategoryIconProps {
  categoryId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CategoryIcon({ categoryId, className, size = 'md' }: CategoryIconProps) {
  const { categories } = useCategory();
  const category = categories?.find(c => c.id === categoryId);

  if (!category?.icon_name || !CATEGORY_ICONS[category.icon_name]) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/10",
        {
          'w-8 h-8': size === 'sm',
          'w-12 h-12': size === 'md',
          'w-16 h-16': size === 'lg',
        },
        className
      )}
    >
      <span 
        className={cn(
          "text-primary-600 dark:text-primary-400",
          {
            'text-sm': size === 'sm',
            'text-base': size === 'md',
            'text-xl': size === 'lg',
          }
        )}
      >
        {CATEGORY_ICONS[category.icon_name]}
      </span>
    </div>
  );
} 