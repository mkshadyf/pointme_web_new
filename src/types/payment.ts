export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'cancelled';

export type PaymentMethodType =
  | 'card'
  | 'apple_pay'
  | 'google_pay'
  | 'paypal'
  | 'bank_transfer'
  | 'ach_debit';

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: PaymentMethodType;
  is_default: boolean;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  bank_account?: {
    bank_name: string;
    last4: string;
    account_type: 'checking' | 'savings';
    routing_number: string;
  };
  paypal?: {
    email: string;
    payer_id: string;
  };
  wallet?: {
    type: 'apple_pay' | 'google_pay';
    device_type: string;
    card_details?: {
      brand: string;
      last4: string;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string;
  metadata: {
    bookingId: string;
    userId: string;
  };
}

export interface PaymentHistory {
  id: string;
  booking_id: string;
  amount: number;
  status: PaymentStatus;
  payment_method_id: string;
  created_at: string;
} 