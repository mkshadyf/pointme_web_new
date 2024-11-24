export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface BookingDetails {
  id: string;
  service: {
    id: string;
    name: string;
    price: number;
    business?: {
      id: string;
      name: string;
      owner_id: string;
    };
  };
  start_time: string;
  end_time: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  client_id: string;
  provider_id: string;
  notes?: string;
  payment_intent?: string;
}

export interface BookingForm {
  service_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface BookingWithService extends BookingDetails {
  service: {
    name: string;
    price: number;
    business: {
      name: string;
      owner_id: string;
    };
  };
} 