import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js';
import { motion } from 'framer-motion';
import { chartService } from '../../services/chartService';

export interface BaseChartProps {
  data: number[] | number[][];
  labels: string[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  currency?: boolean;
  percentage?: boolean;
  animation?: boolean;
  height?: number;
  className?: string;
  options?: Record<string, any>;
}

export function BaseChart({
  data,
  labels,
  title,
  xAxisLabel,
  yAxisLabel,
  currency = false,
  percentage = false,
  animation = true,
  height = 300,
  className,
  options = {},
}: BaseChartProps) {
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
      type: 'line', // Will be overridden by child components
      data,
      labels,
      title,
      xAxisLabel,
      yAxisLabel,
      currency,
      percentage,
      animation,
      ...options,
    });

    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, labels, title, xAxisLabel, yAxisLabel, currency, percentage, animation, options]);

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