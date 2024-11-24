import type { BookingDetails } from '../types/booking';
import { sendEmail } from './emails';
import { supabase } from './supabase';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_INTERVALS = [5, 15, 30]; // minutes

export async function schedulePaymentRetry(bookingId: string, attempt = 1) {
  try {
    // Get booking details
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id(*),
        service:services(*)
      `)
      .eq('id', bookingId)
      .single();

    if (error) throw error;

    // Check if we should retry
    if (attempt > MAX_RETRY_ATTEMPTS) {
      await handleMaxRetriesReached(booking);
      return;
    }

    // Schedule retry
    const retryAfter = RETRY_INTERVALS[attempt - 1] || RETRY_INTERVALS[RETRY_INTERVALS.length - 1];
    const retryAt = new Date(Date.now() + retryAfter * 60 * 1000);

    await supabase.from('payment_retries').insert({
      booking_id: bookingId,
      attempt,
      retry_at: retryAt.toISOString(),
      status: 'scheduled',
    });

    // Notify customer
    await sendRetryNotification(booking, attempt, retryAfter);
  } catch (error) {
    console.error('Error scheduling payment retry:', error);
  }
}

async function handleMaxRetriesReached(booking: BookingDetails) {
  // Update booking status
  await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id);

  // Send final failure notification
  await sendEmail({
    to: booking.client.email,
    subject: 'Payment Failed - Booking Cancelled',
    html: `
      <h1>Payment Failed</h1>
      <p>Dear ${booking.client.full_name},</p>
      <p>We were unable to process your payment after multiple attempts. Your booking has been cancelled.</p>
      <p>Please try booking again with a different payment method.</p>
    `,
  });
}

async function sendRetryNotification(booking: BookingDetails, attempt: number, retryAfter: number) {
  await sendEmail({
    to: booking.client.email,
    subject: 'Payment Retry Scheduled',
    html: `
      <h1>Payment Retry Scheduled</h1>
      <p>Dear ${booking.client.full_name},</p>
      <p>We'll try processing your payment again in ${retryAfter} minutes.</p>
      <p>This is attempt ${attempt} of ${MAX_RETRY_ATTEMPTS}.</p>
      <p>To avoid cancellation, you can update your payment method now:</p>
      <a href="/bookings/${booking.id}/payment">Update Payment Method</a>
    `,
  });
} 