import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { PaymentStatus } from '../types/payment';

interface PaymentUpdate {
  id: string;
  status: PaymentStatus;
  booking_id: string;
  amount: number;
  currency: string;
  updated_at: string;
}

export class RealTimePaymentService {
  private channel: RealtimeChannel;
  private listeners: Map<string, (update: PaymentUpdate) => void>;

  constructor() {
    this.listeners = new Map();
    this.channel = supabase.channel('payment_updates');

    this.channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_intents',
        },
        (payload) => {
          const update = payload.new as PaymentUpdate;
          this.notifyListeners(update);
        }
      )
      .subscribe();
  }

  public subscribe(bookingId: string, callback: (update: PaymentUpdate) => void) {
    this.listeners.set(bookingId, callback);
  }

  public unsubscribe(bookingId: string) {
    this.listeners.delete(bookingId);
  }

  private notifyListeners(update: PaymentUpdate) {
    const listener = this.listeners.get(update.booking_id);
    if (listener) {
      listener(update);
    }
  }

  public async disconnect() {
    await this.channel.unsubscribe();
  }
}

export const realTimePayments = new RealTimePaymentService(); 