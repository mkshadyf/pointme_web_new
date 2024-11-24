import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async () => {
  try {
    // Get pending retries
    const { data: retries, error } = await supabase
      .from('payment_retries')
      .select(`
        *,
        booking:bookings(
          *,
          client:profiles!client_id(*),
          service:services(*)
        )
      `)
      .eq('status', 'scheduled')
      .lte('retry_at', new Date().toISOString());

    if (error) throw error;

    // Process each retry
    for (const retry of retries) {
      try {
        // Update retry status
        await supabase
          .from('payment_retries')
          .update({ status: 'processing' })
          .eq('id', retry.id);

        // Create new payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: retry.booking.service.price * 100,
          currency: 'usd',
          customer: retry.booking.client.stripe_customer_id,
          payment_method: retry.booking.payment_method_id,
          confirm: true,
          off_session: true,
        });

        // Update booking if successful
        if (paymentIntent.status === 'succeeded') {
          await supabase
            .from('bookings')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', retry.booking_id);

          await supabase
            .from('payment_retries')
            .update({
              status: 'completed',
              result: 'success',
              updated_at: new Date().toISOString(),
            })
            .eq('id', retry.id);
        }
      } catch (error) {
        console.error(`Error processing retry ${retry.id}:`, error);

        // Update retry status
        await supabase
          .from('payment_retries')
          .update({
            status: 'failed',
            result: error.message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', retry.id);

        // Schedule next retry if needed
        if (retry.attempt < 3) {
          await supabase.functions.invoke('schedule-payment-retry', {
            body: { bookingId: retry.booking_id, attempt: retry.attempt + 1 },
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ processed: retries.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing retries:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 