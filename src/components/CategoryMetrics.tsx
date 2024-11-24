import { Card, CardContent } from './ui/Card';
import { useCategoryStats } from '../hooks/useCategoryStats';
import { useCategory } from '../contexts/CategoryContext';
import CategoryIcon from './CategoryIcon';
import { formatPrice } from '../lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../lib/utils';

export default function CategoryMetrics() {
  const { stats, getTotalServices, getAveragePrice } = useCategoryStats();
  const { categories } = useCategory();

  if (!stats || !categories) return null;

  const totalServices = getTotalServices();
  const avgPrice = getAveragePrice();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {categories.map(category => {
        const categoryStats = stats.find(s => s.category_id === category.id);
        const serviceCount = parseInt(categoryStats?.count || '0');
        const avgCategoryPrice = categoryStats?.avg_price || 0;
        const priceDiff = avgCategoryPrice - avgPrice;
        const servicePct = (serviceCount / totalServices) * 100;

        return (
          <Card key={category.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CategoryIcon categoryId={category.id} size="lg" />
                <div>
                  <h3 className="font-semibold dark:text-white">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {serviceCount} services ({servicePct.toFixed(1)}%)
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-2xl font-bold dark:text-white">
                  {formatPrice(avgCategoryPrice)}
                </span>
                <span className={cn(
                  "text-sm flex items-center gap-1",
                  priceDiff > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {priceDiff > 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {Math.abs(priceDiff).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 