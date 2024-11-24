import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useCategories } from '../hooks/useCategories';
import { Line } from 'react-chartjs-2';
import type { ChartData } from 'chart.js';

interface BookingWithService {
  created_at: string;
  price: number;
  service: {
    category_id: string;
  };
}

interface ServiceResponse {
  category_id: string;
}

interface ProcessedData {
  [month: string]: {
    [category: string]: number;
  };
}

export default function CategoryTrends() {
  const { categories } = useCategories();

  const { data: bookings } = useQuery<BookingWithService[]>({
    queryKey: ['category-trends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          created_at,
          price,
          service:services!inner(
            category_id
          )
        `)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at');

      if (error) throw error;

      return data.map(booking => ({
        created_at: booking.created_at,
        price: booking.price,
        service: {
          category_id: (booking.service as unknown as ServiceResponse).category_id
        }
      }));
    },
  });

  const processedData = useMemo(() => {
    if (!bookings || !categories) return null;

    const monthlyData: ProcessedData = {};
    
    bookings.forEach((booking) => {
      const month = new Date(booking.created_at).toLocaleString('default', { month: 'short' });
      const category = categories.find(c => c.id === booking.service.category_id);
      
      if (!category) return;
      
      if (!monthlyData[month]) {
        monthlyData[month] = {};
        categories.forEach(cat => {
          monthlyData[month][cat.name] = 0;
        });
      }
      
      monthlyData[month][category.name] = (monthlyData[month][category.name] || 0) + booking.price;
    });

    const months = Object.keys(monthlyData).sort((a, b) => {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });

    const chartData: ChartData<'line'> = {
      labels: months,
      datasets: categories.map((category, index) => ({
        label: category.name,
        data: months.map(month => monthlyData[month][category.name] || 0),
        borderColor: `hsl(${index * 360 / categories.length}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 360 / categories.length}, 70%, 50%, 0.5)`,
        tension: 0.4,
      })),
    };

    return chartData;
  }, [bookings, categories]);

  if (!processedData) return null;

  return (
    <div className="w-full h-[400px]">
      <Line
        data={processedData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `$${value}`,
              },
            },
          },
          plugins: {
            legend: {
              position: 'bottom',
            },
            tooltip: {
              callbacks: {
                label: (context) => `$${context.parsed.y.toFixed(2)}`,
              },
            },
          },
        }}
      />
    </div>
  );
}