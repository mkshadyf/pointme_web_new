import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AnalyticsEvent {
  business_id: string;
  event_type: string;
  event_data: Record<string, any>;
}

interface AnalyticsSubscription {
  businessId: string;
  eventTypes: string[];
  callback: (event: AnalyticsEvent) => void;
}

export class RealTimeAnalyticsService {
  private channel: RealtimeChannel;
  private subscriptions: Map<string, AnalyticsSubscription[]>;

  constructor() {
    this.subscriptions = new Map();
    this.channel = supabase.channel('analytics');
    this.initializeChannel();
  }

  private initializeChannel() {
    this.channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'analytics_events' },
        (payload) => {
          this.handleEvent(payload.new as AnalyticsEvent);
        }
      )
      .subscribe();
  }

  private handleEvent(event: AnalyticsEvent) {
    const businessSubs = this.subscriptions.get(event.business_id) || [];
    businessSubs.forEach(sub => {
      if (sub.eventTypes.includes(event.event_type)) {
        sub.callback(event);
      }
    });
  }

  public async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>) {
    const { error } = await supabase
      .from('analytics_events')
      .insert(event);

    if (error) throw error;
  }

  public subscribe(subscription: AnalyticsSubscription) {
    const existing = this.subscriptions.get(subscription.businessId) || [];
    this.subscriptions.set(subscription.businessId, [...existing, subscription]);
  }

  public unsubscribe(businessId: string, callback: Function) {
    const existing = this.subscriptions.get(businessId) || [];
    this.subscriptions.set(
      businessId,
      existing.filter(sub => sub.callback !== callback)
    );
  }

  public async disconnect() {
    await this.channel.unsubscribe();
  }
}

export const realTimeAnalytics = new RealTimeAnalyticsService(); 