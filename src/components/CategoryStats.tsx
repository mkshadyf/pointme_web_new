import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useCategories } from '../hooks/useCategories';
import { Pie } from 'react-chartjs-2';
import { formatPrice } from '../lib/utils';
import type { CategoryStats as CategoryStatsType } from '../types/category';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryStats() {
  const { categories } = useCategories();

  const { data: stats } = useQuery<CategoryStatsType[]>({
    queryKey: ['category-stats'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_category_stats');
      return data as CategoryStatsType[];
    },
    enabled: !!categories,
  });

  const chartData: ChartData<'pie'> = {
    labels: stats?.map(stat => 
      categories?.find(c => c.id === stat.category_id)?.name || 'Unknown'
    ),
    datasets: [{
      data: stats?.map(stat => parseInt(stat.count)) || [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    }],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] relative">
          <Pie
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right' as const,
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const index = context.dataIndex;
                      const stat = stats?.[index];
                      if (!stat) return '';
                      return [
                        `Services: ${stat.count}`,
                        `Avg Price: ${formatPrice(stat.avg_price)}`,
                      ];
                    },
                  },
                },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
} 