import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export async function createPaymentIntent(bookingId: string, amount: number) {
  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: { bookingId, amount },
  });

  if (error) throw error;
  return data as { clientSecret: string };
}

export async function createSetupIntent() {
  const { data, error } = await supabase.functions.invoke('create-setup-intent', {
    body: {},
  });

  if (error) throw error;
  return data as { clientSecret: string };
}

export async function processRefund(bookingId: string, amount: number) {
  const { data, error } = await supabase.functions.invoke('process-refund', {
    body: { bookingId, amount },
  });

  if (error) throw error;
  return data;
} 