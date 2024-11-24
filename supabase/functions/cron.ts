import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Process payment retries
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-payment-retries`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
    });

    return new Response('OK');
  } catch (error) {
    console.error('Cron job error:', error);
    return new Response(error.message, { status: 500 });
  }
}); 