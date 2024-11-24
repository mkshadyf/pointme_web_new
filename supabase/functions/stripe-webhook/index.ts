import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

async function logWebhookEvent(event: any, error?: Error) {
  try {
    await supabase.from('webhook_logs').insert({
      event_type: event.type,
      event_id: event.id,
      payload: event,
      error: error?.message,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Error logging webhook event:', err)
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
    })
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const body = await req.text()

    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature || '',
        webhookSecret || ''
      )
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed.`, err.message)
      await logWebhookEvent({ type: 'signature_verification_failed', body }, err)
      return new Response(JSON.stringify({ error: err.message }), { status: 400 })
    }

    // Log the event
    await logWebhookEvent(event)

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object
          const { bookingId } = paymentIntent.metadata

          // Update booking status
          const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              payment_id: paymentIntent.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId)
            .select(`
              *,
              client:profiles!client_id(*),
              provider:profiles!provider_id(*),
              service:services(*)
            `)
            .single()

          if (bookingError) {
            console.error('Error updating booking:', bookingError)
            throw bookingError
          }

          // Send notifications and emails
          await Promise.all([
            // Notify provider
            supabase.from('notifications').insert({
              user_id: booking.provider_id,
              type: 'payment_received',
              title: 'Payment Received',
              message: `Payment received for booking #${booking.id}`,
              data: { booking_id: booking.id },
              read: false,
            }),
            // Notify client
            supabase.from('notifications').insert({
              user_id: booking.client_id,
              type: 'payment_received',
              title: 'Payment Successful',
              message: 'Your payment has been processed successfully',
              data: { booking_id: booking.id },
              read: false,
            }),
            // Send provider email
            sendEmail(
              booking.provider.email,
              'New Booking Payment Received',
              `
                <h1>Payment Received</h1>
                <p>A payment has been received for booking #${booking.id}</p>
                <p>Client: ${booking.client.full_name}</p>
                <p>Service: ${booking.service.name}</p>
                <p>Amount: $${paymentIntent.amount / 100}</p>
                <p>Date: ${new Date(booking.start_time).toLocaleDateString()}</p>
                <p>Time: ${new Date(booking.start_time).toLocaleTimeString()} - ${new Date(booking.end_time).toLocaleTimeString()}</p>
              `
            ),
            // Send client email
            sendEmail(
              booking.client.email,
              'Payment Confirmation',
              `
                <h1>Payment Successful</h1>
                <p>Your payment for booking #${booking.id} has been processed successfully.</p>
                <p>Service: ${booking.service.name}</p>
                <p>Provider: ${booking.provider.full_name}</p>
                <p>Amount: $${paymentIntent.amount / 100}</p>
                <p>Date: ${new Date(booking.start_time).toLocaleDateString()}</p>
                <p>Time: ${new Date(booking.start_time).toLocaleTimeString()} - ${new Date(booking.end_time).toLocaleTimeString()}</p>
              `
            ),
          ])

          break
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object
          const { bookingId } = paymentIntent.metadata

          // Update booking status
          const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .update({
              payment_status: 'failed',
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId)
            .select(`
              *,
              client:profiles!client_id(*),
              provider:profiles!provider_id(*),
              service:services(*)
            `)
            .single()

          if (bookingError) {
            console.error('Error updating booking:', bookingError)
            throw bookingError
          }

          // Send notifications and emails
          await Promise.all([
            // Notify provider
            supabase.from('notifications').insert({
              user_id: booking.provider_id,
              type: 'payment_failed',
              title: 'Payment Failed',
              message: `Payment failed for booking #${booking.id}`,
              data: { booking_id: booking.id },
              read: false,
            }),
            // Notify client
            supabase.from('notifications').insert({
              user_id: booking.client_id,
              type: 'payment_failed',
              title: 'Payment Failed',
              message: 'Your payment could not be processed. Please try again.',
              data: { booking_id: booking.id },
              read: false,
            }),
            // Send provider email
            sendEmail(
              booking.provider.email,
              'Booking Payment Failed',
              `
                <h1>Payment Failed</h1>
                <p>A payment has failed for booking #${booking.id}</p>
                <p>Client: ${booking.client.full_name}</p>
                <p>Service: ${booking.service.name}</p>
                <p>Amount: $${paymentIntent.amount / 100}</p>
                <p>Date: ${new Date(booking.start_time).toLocaleDateString()}</p>
                <p>Time: ${new Date(booking.start_time).toLocaleTimeString()} - ${new Date(booking.end_time).toLocaleTimeString()}</p>
              `
            ),
            // Send client email
            sendEmail(
              booking.client.email,
              'Payment Failed',
              `
                <h1>Payment Failed</h1>
                <p>Your payment for booking #${booking.id} could not be processed.</p>
                <p>Service: ${booking.service.name}</p>
                <p>Provider: ${booking.provider.full_name}</p>
                <p>Amount: $${paymentIntent.amount / 100}</p>
                <p>Please try again with a different payment method or contact your bank for assistance.</p>
                <p><a href="${Deno.env.get('FRONTEND_URL')}/bookings/${booking.id}/payment">Try Payment Again</a></p>
              `
            ),
          ])

          break
        }

        case 'charge.refunded': {
          const charge = event.data.object
          const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent as string)
          const { bookingId } = paymentIntent.metadata

          // Update booking status
          const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .update({
              payment_status: 'refunded',
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId)
            .select(`
              *,
              client:profiles!client_id(*),
              provider:profiles!provider_id(*),
              service:services(*)
            `)
            .single()

          if (bookingError) {
            console.error('Error updating booking:', bookingError)
            throw bookingError
          }

          // Send notifications and emails
          await Promise.all([
            // Notify provider
            supabase.from('notifications').insert({
              user_id: booking.provider_id,
              type: 'payment_refunded',
              title: 'Payment Refunded',
              message: `Payment refunded for booking #${booking.id}`,
              data: { booking_id: booking.id },
              read: false,
            }),
            // Notify client
            supabase.from('notifications').insert({
              user_id: booking.client_id,
              type: 'payment_refunded',
              title: 'Payment Refunded',
              message: 'Your payment has been refunded',
              data: { booking_id: booking.id },
              read: false,
            }),
            // Send provider email
            sendEmail(
              booking.provider.email,
              'Booking Payment Refunded',
              `
                <h1>Payment Refunded</h1>
                <p>A payment has been refunded for booking #${booking.id}</p>
                <p>Client: ${booking.client.full_name}</p>
                <p>Service: ${booking.service.name}</p>
                <p>Amount: $${charge.amount_refunded / 100}</p>
                <p>Date: ${new Date(booking.start_time).toLocaleDateString()}</p>
                <p>Time: ${new Date(booking.start_time).toLocaleTimeString()} - ${new Date(booking.end_time).toLocaleTimeString()}</p>
              `
            ),
            // Send client email
            sendEmail(
              booking.client.email,
              'Payment Refunded',
              `
                <h1>Payment Refunded</h1>
                <p>Your payment for booking #${booking.id} has been refunded.</p>
                <p>Service: ${booking.service.name}</p>
                <p>Provider: ${booking.provider.full_name}</p>
                <p>Refund Amount: $${charge.amount_refunded / 100}</p>
                <p>The refund should appear in your account within 5-10 business days.</p>
              `
            ),
          ])

          break
        }

        case 'payment_method.attached': {
          const paymentMethod = event.data.object;

          // Handle different payment method types
          let paymentMethodData: any = {
            id: paymentMethod.id,
            type: paymentMethod.type,
            customer: paymentMethod.customer,
          };

          switch (paymentMethod.type) {
            case 'card':
              paymentMethodData.card = {
                brand: paymentMethod.card.brand,
                last4: paymentMethod.card.last4,
                exp_month: paymentMethod.card.exp_month,
                exp_year: paymentMethod.card.exp_year,
              };
              break;

            case 'us_bank_account':
              paymentMethodData.bank_account = {
                bank_name: paymentMethod.us_bank_account.bank_name,
                last4: paymentMethod.us_bank_account.last4,
                account_type: paymentMethod.us_bank_account.account_type,
                routing_number: paymentMethod.us_bank_account.routing_number,
              };
              break;

            case 'paypal':
              paymentMethodData.paypal = {
                email: paymentMethod.paypal.email,
                payer_id: paymentMethod.paypal.payer_id,
              };
              break;

            case 'wallet':
              paymentMethodData.wallet = {
                type: paymentMethod.wallet.type,
                device_type: paymentMethod.wallet.device_type,
                card_details: paymentMethod.wallet.card_details ? {
                  brand: paymentMethod.wallet.card_details.brand,
                  last4: paymentMethod.wallet.card_details.last4,
                } : undefined,
              };
              break;
          }

          // Store payment method in database
          await supabase
            .from('payment_methods')
            .insert(paymentMethodData);

          break;
        }
      }
    } catch (err) {
      console.error(`Error processing webhook event ${event.type}:`, err)
      await logWebhookEvent(event, err)
      throw err
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error(`Error processing webhook:`, err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 