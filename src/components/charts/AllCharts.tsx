export function AreaChart(props: BaseChartProps) {
  return <BaseChart {...props} options={{ type: 'line', fill: true }} />;
}

export function BarChart(props: BaseChartProps & { horizontal?: boolean; stacked?: boolean }) {
  return (
    <BaseChart
      {...props}
      options={{
        type: props.horizontal ? 'horizontalBar' : 'bar',
        stacked: props.stacked,
      }}
    />
  );
}

export function BubbleChart(props: Omit<BaseChartProps, 'data'> & { data: { x: number; y: number; r: number }[] }) {
  return <BaseChart {...props} options={{ type: 'bubble' }} />;
}

export function DonutChart(props: BaseChartProps & { cutout?: number }) {
  return (
    <BaseChart
      {...props}
      options={{
        type: 'doughnut',
        cutout: `${props.cutout || 50}%`,
      }}
    />
  );
}

export function PieChart(props: BaseChartProps) {
  return <BaseChart {...props} options={{ type: 'pie' }} />;
}

export function RadarChart(props: BaseChartProps) {
  return <BaseChart {...props} options={{ type: 'radar' }} />;
}

export function ScatterChart(props: Omit<BaseChartProps, 'data'> & { data: { x: number; y: number }[] }) {
  return <BaseChart {...props} options={{ type: 'scatter' }} />;
}

export function SparklineChart(props: BaseChartProps) {
  return (
    <BaseChart
      {...props}
      options={{
        type: 'line',
        showGrid: false,
        showLabels: false,
        showLegend: false,
        height: 50,
      }}
    />
  );
}

export function HeatmapChart(props: Omit<BaseChartProps, 'data'> & { data: number[][] }) {
  return (
    <BaseChart
      {...props}
      options={{
        type: 'matrix',
        showScale: true,
        colorScheme: 'interpolateRdYlBu',
      }}
    />
  );
}

export function GaugeChart(props: BaseChartProps & { min?: number; max?: number; value: number }) {
  return (
    <BaseChart
      {...props}
      options={{
        type: 'doughnut',
        circumference: 180,
        rotation: -90,
        cutout: '75%',
        value: props.value,
        min: props.min || 0,
        max: props.max || 100,
      }}
    />
  );
}

export function FunnelChart(props: BaseChartProps) {
  return (
    <BaseChart
      {...props}
      options={{
        type: 'bar',
        horizontal: true,
        showConnectors: true,
        sort: 'desc',
      }}
    />
  );
}

export function TreemapChart(props: Omit<BaseChartProps, 'data'> & { data: { name: string; value: number }[] }) {
  return (
    <BaseChart
      {...props}
      options={{
        type: 'treemap',
        showLabels: true,
        colorScale: true,
      }}
    />
  );
}

export function ComboChart(props: BaseChartProps & { types: ('line' | 'bar')[] }) {
  return (
    <BaseChart
      {...props}
      options={{
        type: 'combo',
        chartTypes: props.types,
      }}
    />
  );
}

export function CandlestickChart(
  props: Omit<BaseChartProps, 'data'> & {
    data: { open: number; high: number; low: number; close: number }[];
  }
) {
  return (
    <BaseChart
      {...props}
      options={{
        type: 'candlestick',
        showVolume: true,
      }}
    />
  );
} 