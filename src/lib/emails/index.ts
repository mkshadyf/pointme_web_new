import { supabase } from '../supabase';
import { emailTemplates } from './templates';

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(data: EmailData) {
  const { error } = await supabase.functions.invoke('send-email', {
    body: data,
  });

  if (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendPaymentSuccessEmail(bookingId: string) {
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      *,
      client:profiles!client_id(*),
      service:services(
        *,
        business:businesses(*)
      )
    `)
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;

  const emailData = {
    customerName: booking.client.full_name,
    serviceName: booking.service.name,
    businessName: booking.service.business.name,
    amount: booking.total_amount,
    bookingId: booking.id,
    date: new Date(booking.start_time).toLocaleDateString(),
    time: `${new Date(booking.start_time).toLocaleTimeString()} - ${new Date(booking.end_time).toLocaleTimeString()}`,
  };

  await sendEmail({
    to: booking.client.email,
    subject: emailTemplates.paymentSuccess.subject,
    html: emailTemplates.paymentSuccess.html(emailData),
  });
}

export async function sendPaymentFailedEmail(bookingId: string) {
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      *,
      client:profiles!client_id(*),
      service:services(
        *,
        business:businesses(*)
      )
    `)
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;

  const emailData = {
    customerName: booking.client.full_name,
    serviceName: booking.service.name,
    businessName: booking.service.business.name,
    amount: booking.total_amount,
    bookingId: booking.id,
  };

  await sendEmail({
    to: booking.client.email,
    subject: emailTemplates.paymentFailed.subject,
    html: emailTemplates.paymentFailed.html(emailData),
  });
} 