import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';
import { motion } from 'framer-motion';
import { chartService } from '../../services/chartService';

interface BarChartProps {
  data: number[] | number[][];
  labels: string[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  currency?: boolean;
  percentage?: boolean;
  horizontal?: boolean;
  stacked?: boolean;
  animation?: boolean;
  height?: number;
  className?: string;
}

export function BarChart({
  data,
  labels,
  title,
  xAxisLabel,
  yAxisLabel,
  currency = false,
  percentage = false,
  horizontal = false,
  stacked = false,
  animation = true,
  height = 300,
  className,
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart>();

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const config = chartService.generateConfig({
      type: horizontal ? 'horizontalBar' : 'bar',
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

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, labels, title, xAxisLabel, yAxisLabel, currency, percentage, horizontal, stacked, animation]);

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