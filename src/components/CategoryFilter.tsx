import { useCategories } from '../hooks/useCategories';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { CATEGORY_ICONS } from '../types/category';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  className?: string;
}

export default function CategoryFilter({ 
  selectedCategory, 
  onSelectCategory,
  className 
}: CategoryFilterProps) {
  const { categories, isLoading } = useCategories();

  if (isLoading) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSelectCategory(null)}
        className={cn(
          "rounded-full",
          !selectedCategory && "bg-primary-50 text-primary-900 hover:bg-primary-100"
        )}
      >
        All Categories
      </Button>
      {categories?.map((category) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "rounded-full",
              selectedCategory === category.id && "bg-primary-50 text-primary-900 hover:bg-primary-100"
            )}
          >
            {category.icon_name && CATEGORY_ICONS[category.icon_name] && (
              <span className="mr-2">{CATEGORY_ICONS[category.icon_name]}</span>
            )}
            {category.name}
          </Button>
        </motion.div>
      ))}
    </div>
  );
} 