export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export type SubscriptionInterval = 'day' | 'week' | 'month' | 'year';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: SubscriptionInterval;
  trial_days?: number;
  features: string[];
  metadata?: Record<string, any>;
}

export interface Subscription {
  id: string;
  customer_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  trial_end?: string;
  metadata?: Record<string, any>;
} 