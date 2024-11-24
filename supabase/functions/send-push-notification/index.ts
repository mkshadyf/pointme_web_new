import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://esm.sh/web-push@3.6.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

webpush.setVapidDetails(
  'mailto:support@yourapp.com',
  Deno.env.get('VAPID_PUBLIC_KEY') || '',
  Deno.env.get('VAPID_PRIVATE_KEY') || ''
);

serve(async (req) => {
  try {
    const { userId, title, body, url } = await req.json();

    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    if (error) throw error;

    // Send notifications
    const results = await Promise.all(
      subscriptions.map(async ({ subscription }) => {
        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title,
              body,
              url,
            })
          );
          return { success: true };
        } catch (error) {
          // Remove invalid subscriptions
          if (error.statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('subscription', subscription);
          }
          return { success: false, error: error.message };
        }
      })
    );

    return new Response(
      JSON.stringify({
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 