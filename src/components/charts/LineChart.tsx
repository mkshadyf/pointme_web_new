import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js';
import { motion } from 'framer-motion';
import { chartService } from '../../services/chartService';

interface LineChartProps {
  data: number[] | number[][];
  labels: string[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  currency?: boolean;
  percentage?: boolean;
  comparison?: boolean;
  baseline?: number[];
  stacked?: boolean;
  animation?: boolean;
  height?: number;
  className?: string;
}

export function LineChart({
  data,
  labels,
  title,
  xAxisLabel,
  yAxisLabel,
  currency = false,
  percentage = false,
  comparison = false,
  baseline,
  stacked = false,
  animation = true,
  height = 300,
  className,
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart>();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create new chart
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const config = comparison
      ? chartService.generateComparisonConfig({
          type: 'line',
          data,
          labels,
          title,
          xAxisLabel,
          yAxisLabel,
          stacked,
          currency,
          percentage,
          animation,
          baseline,
        })
      : chartService.generateConfig({
          type: 'line',
          data,
          labels,
          title,
          xAxisLabel,
          yAxisLabel,
          stacked,
          currency,
          percentage,
          animation,
        });

    chartRef.current = new Chart(ctx, config);

    // Cleanup
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, labels, title, xAxisLabel, yAxisLabel, currency, percentage, comparison, baseline, stacked, animation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
      style={{ height }}
    >
      <canvas ref={canvasRef} />
    </motion.div>
  );
} 