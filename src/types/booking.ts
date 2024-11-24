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
  status: string;
  payment_status: string;
  total_amount: number;
  client_id: string;
  provider_id: string;
  notes?: string;
}

export interface BookingForm {
  service_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface BookingWithService extends Omit<BookingDetails, 'service'> {
  service: {
    id: string;
    name: string;
    price: number;
    business: {
      id: string;
      name: string;
      owner_id: string;
    };
  };
} 