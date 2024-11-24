import { supabase } from '../lib/supabase';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export class AnalyticsService {
  private queue: AnalyticsEvent[] = [];
  private batchSize = 10;
  private batchTimeout = 5000;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.setupPerformanceObservers();
    window.addEventListener('beforeunload', () => this.flush());
  }

  private setupPerformanceObservers() {
    // First Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        const fcp = entries[0];
        this.trackPerformance({ fcp: fcp.startTime });
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.trackPerformance({ lcp: lastEntry.startTime });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        this.trackPerformance({ fid: entry.processingStart - entry.startTime });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      let cls = 0;
      entryList.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });
      this.trackPerformance({ cls });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  async track(event: AnalyticsEvent) {
    this.queue.push({
      ...event,
      timestamp: Date.now(),
    });

    if (this.queue.length >= this.batchSize) {
      await this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.batchTimeout);
    }
  }

  private async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await supabase.from('analytics_events').insert(
        events.map(event => ({
          event_name: event.name,
          properties: event.properties,
          timestamp: event.timestamp,
        }))
      );
    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Re-queue failed events
      this.queue.unshift(...events);
    }
  }

  private async trackPerformance(metrics: Partial<PerformanceMetrics>) {
    await this.track({
      name: 'performance_metrics',
      properties: metrics,
    });
  }

  async trackPageView(path: string, properties?: Record<string, any>) {
    await this.track({
      name: 'page_view',
      properties: {
        path,
        referrer: document.referrer,
        ...properties,
      },
    });
  }

  async trackError(error: Error, context?: Record<string, any>) {
    await this.track({
      name: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }

  async trackInteraction(
    type: string,
    element: string,
    properties?: Record<string, any>
  ) {
    await this.track({
      name: 'interaction',
      properties: {
        type,
        element,
        ...properties,
      },
    });
  }
}

export const analyticsService = new AnalyticsService(); 