export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

export interface PaymentAnalytics {
  id: string;
  business_id: string;
  service_id: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method_type: string;
  customer_id: string;
  created_at: string;
}

export interface PaymentMetrics {
  id: string;
  business_id: string;
  date: string;
  total_payments: number;
  total_amount: number;
  successful_payments: number;
  failed_payments: number;
  refunded_payments: number;
  average_amount: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsDateRange {
  start: Date;
  end: Date;
}

export interface PaymentTrend {
  date: string;
  value: number;
  change: number;
}

export interface ServiceAnalytics {
  service_id: string;
  service_name: string;
  total_bookings: number;
  total_revenue: number;
  average_rating: number;
} 