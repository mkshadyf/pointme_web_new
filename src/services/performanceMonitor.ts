export class PerformanceMonitor {
  private metrics: {
    [key: string]: {
      value: number;
      timestamp: number;
    }[];
  } = {};

  constructor() {
    this.setupObservers();
    this.trackResources();
    this.trackErrors();
  }

  private setupObservers() {
    // Core Web Vitals
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.logMetric('LCP', entry);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.logMetric('FID', entry);
      }
    }).observe({ entryTypes: ['first-input'] });

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.logMetric('CLS', entry);
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private trackResources() {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.logMetric('ResourceTiming', entry);
      }
    }).observe({ entryTypes: ['resource'] });
  }

  private trackErrors() {
    window.addEventListener('error', (event) => {
      this.logError('error', event);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError('promise_rejection', event);
    });
  }

  private async logMetric(type: string, entry: any) {
    if (!this.metrics[type]) {
      this.metrics[type] = [];
    }

    this.metrics[type].push({
      value: entry.value || entry.duration || 0,
      timestamp: Date.now(),
    });

    // Send to analytics if buffer is full
    if (this.metrics[type].length >= 10) {
      await this.flushMetrics(type);
    }
  }

  private async flushMetrics(type: string) {
    const metrics = this.metrics[type];
    this.metrics[type] = [];

    await supabase.from('performance_metrics').insert(
      metrics.map(m => ({
        type,
        value: m.value,
        timestamp: new Date(m.timestamp).toISOString(),
      }))
    );
  }

  private async logError(type: string, event: any) {
    await supabase.from('error_logs').insert({
      type,
      message: event.message || event.reason,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
    });
  }
}

export const performanceMonitor = new PerformanceMonitor(); 