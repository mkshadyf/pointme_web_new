import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';
import { motion } from 'framer-motion';
import { chartService } from '../../services/chartService';

interface PieChartProps {
  data: number[];
  labels: string[];
  title?: string;
  currency?: boolean;
  percentage?: boolean;
  animation?: boolean;
  height?: number;
  className?: string;
  cutout?: number;
}

export function PieChart({
  data,
  labels,
  title,
  currency = false,
  percentage = false,
  animation = true,
  height = 300,
  className,
  cutout = 0,
}: PieChartProps) {
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
      type: 'pie',
      data,
      labels,
      title,
      currency,
      percentage,
      animation,
      options: {
        cutout: `${cutout}%`,
      },
    });

    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, labels, title, currency, percentage, animation, cutout]);

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