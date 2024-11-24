import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { SMTPClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const client = new SMTPClient({
  connection: {
    hostname: Deno.env.get('SMTP_HOST') || '',
    port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
    tls: true,
    auth: {
      username: Deno.env.get('SMTP_USER') || '',
      password: Deno.env.get('SMTP_PASS') || '',
    },
  },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  try {
    const { to, subject, html } = await req.json();

    // Validate input
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send email
    await client.send({
      from: Deno.env.get('SMTP_FROM') || '',
      to,
      subject,
      content: 'text/html',
      html,
    });

    // Log email
    await supabase.from('email_logs').insert({
      to,
      subject,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);

    // Log error
    await supabase.from('email_logs').insert({
      to: (req.json().to as string) || 'unknown',
      subject: (req.json().subject as string) || 'unknown',
      status: 'failed',
      error: error.message,
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}); 