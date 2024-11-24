import { useState } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Select } from './ui/Select';
import { LoadingState } from './LoadingState';
import { ErrorMessage } from './ErrorMessage';
import { usePaymentAnalytics } from '../hooks/usePaymentAnalytics';
import { formatCurrency } from '../lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PaymentAnalyticsDashboardProps {
  businessId: string;
}

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '12m', label: 'Last 12 Months' },
];

export function PaymentAnalyticsDashboard({ businessId }: PaymentAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('30d');
  
  const dateRange = {
    start: new Date(Date.now() - getTimeRangeInMs(timeRange)),
    end: new Date(),
  };

  const { analytics, metrics, isLoading } = usePaymentAnalytics(businessId, dateRange);

  if (isLoading) return <LoadingState />;
  if (!analytics || !metrics) return <ErrorMessage error={new Error('Failed to load analytics')} />;

  const revenueData: ChartData<'line'> = {
    labels: metrics.map(m => m.date),
    datasets: [
      {
        label: 'Revenue',
        data: metrics.map(m => m.total_amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const paymentsData: ChartData<'bar'> = {
    labels: metrics.map(m => m.date),
    datasets: [
      {
        label: 'Successful',
        data: metrics.map(m => m.successful_payments),
        backgroundColor: 'rgb(34, 197, 94)',
      },
      {
        label: 'Failed',
        data: metrics.map(m => m.failed_payments),
        backgroundColor: 'rgb(239, 68, 68)',
      },
      {
        label: 'Refunded',
        data: metrics.map(m => m.refunded_payments),
        backgroundColor: 'rgb(234, 179, 8)',
      },
    ],
  };

  const totalRevenue = metrics.reduce((sum, m) => sum + m.total_amount, 0);
  const totalPayments = metrics.reduce((sum, m) => sum + m.total_payments, 0);
  const averageAmount = totalPayments > 0 ? totalRevenue / totalPayments : 0;
  const successRate = totalPayments > 0 
    ? (metrics.reduce((sum, m) => sum + m.successful_payments, 0) / totalPayments) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
          options={TIME_RANGES}
          className="w-48"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            color: 'blue',
          },
          {
            title: 'Total Payments',
            value: totalPayments,
            color: 'green',
          },
          {
            title: 'Average Amount',
            value: formatCurrency(averageAmount),
            color: 'purple',
          },
          {
            title: 'Success Rate',
            value: `${successRate.toFixed(1)}%`,
            color: 'orange',
          },
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: value => formatCurrency(value as number),
                      },
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: context => formatCurrency(context.parsed.y),
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar
                data={paymentsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      stacked: true,
                    },
                    x: {
                      stacked: true,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getTimeRangeInMs(range: string): number {
  const DAY = 24 * 60 * 60 * 1000;
  switch (range) {
    case '7d': return 7 * DAY;
    case '30d': return 30 * DAY;
    case '90d': return 90 * DAY;
    case '12m': return 365 * DAY;
    default: return 30 * DAY;
  }
} 