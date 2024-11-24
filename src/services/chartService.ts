import { ChartConfiguration } from 'chart.js';
import { formatCurrency } from '../lib/utils';

type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter';

interface ChartOptions {
  type: ChartType;
  data: any[];
  labels: string[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  stacked?: boolean;
  currency?: boolean;
  percentage?: boolean;
  animation?: boolean;
}

export class ChartService {
  private defaultColors = [
    'rgb(59, 130, 246)', // blue
    'rgb(34, 197, 94)',  // green
    'rgb(239, 68, 68)',  // red
    'rgb(234, 179, 8)',  // yellow
    'rgb(168, 85, 247)', // purple
    'rgb(236, 72, 153)', // pink
  ];

  public generateConfig(options: ChartOptions): ChartConfiguration {
    const {
      type,
      data,
      labels,
      title,
      xAxisLabel,
      yAxisLabel,
      colors = this.defaultColors,
      stacked = false,
      currency = false,
      percentage = false,
      animation = true,
    } = options;

    return {
      type,
      data: {
        labels,
        datasets: Array.isArray(data[0])
          ? data.map((d, i) => ({
            data: d,
            label: `Dataset ${i + 1}`,
            backgroundColor: colors[i % colors.length],
            borderColor: colors[i % colors.length],
            borderWidth: 1,
          }))
          : [{
            data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
          }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: animation ? 1000 : 0,
        },
        plugins: {
          title: title ? {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: 'bold',
            },
          } : undefined,
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                let value = context.parsed.y ?? context.parsed;
                if (currency) {
                  return formatCurrency(value);
                }
                if (percentage) {
                  return `${value.toFixed(1)}%`;
                }
                return value.toLocaleString();
              },
            },
          },
        },
        scales: type === 'line' || type === 'bar' ? {
          x: {
            stacked,
            title: xAxisLabel ? {
              display: true,
              text: xAxisLabel,
            } : undefined,
          },
          y: {
            stacked,
            title: yAxisLabel ? {
              display: true,
              text: yAxisLabel,
            } : undefined,
            ticks: {
              callback: (value: any) => {
                if (currency) {
                  return formatCurrency(value);
                }
                if (percentage) {
                  return `${value}%`;
                }
                return value.toLocaleString();
              },
            },
          },
        } : undefined,
      },
    };
  }

  public generateTimeSeriesConfig(options: Omit<ChartOptions, 'labels'> & { dates: Date[] }): ChartConfiguration {
    const { dates, ...rest } = options;
    const labels = dates.map(d => d.toLocaleDateString());
    return this.generateConfig({ ...rest, labels });
  }

  public generateComparisonConfig(options: ChartOptions & { baseline?: number[] }): ChartConfiguration {
    const { baseline, ...rest } = options;
    const config = this.generateConfig(rest);

    if (baseline) {
      (config.data.datasets as any[]).push({
        data: baseline,
        label: 'Previous Period',
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
        borderDash: [5, 5],
      });
    }

    return config;
  }

  public generateHeatmapConfig(data: number[][], labels: { x: string[]; y: string[] }): ChartConfiguration {
    return {
      type: 'matrix',
      data: {
        datasets: [{
          data: data.flatMap((row, i) =>
            row.map((value, j) => ({
              x: j,
              y: i,
              v: value,
            }))
          ),
        }],
      },
      options: {
        plugins: {
          legend: false as const,
          tooltip: {
            callbacks: {
              title: () => '',
              label: (ctx: any) => {
                const { x, y, v } = ctx.raw;
                return `${labels.y[y]}, ${labels.x[x]}: ${v}`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              callback: (v: any) => labels.x[v],
            },
          },
          y: {
            ticks: {
              callback: (v: any) => labels.y[v],
            },
          },
        },
      },
    };
  }
}

export const chartService = new ChartService(); 